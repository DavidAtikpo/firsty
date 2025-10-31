import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ products: [] })
    }

    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("active") === "true"
    const category = searchParams.get("category")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    // Construire la clause where
    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }
    if (category) {
      where.categoryId = category
    }

    const products = await prisma.product.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error in GET /api/products:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ products: [] })
    }

    return NextResponse.json({ error: "Erreur lors de la récupération des produits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ product: null })
    }

    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, image, stock } = body

    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number.parseFloat(price),
        image,
        stock: Number.parseInt(stock),
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error in POST /api/products:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ product: null })
    }

    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 })
  }
}
