import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ commissions: [] })
    }

    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Fetch all commissions (filtering can be added later via query params if needed)
    const commissions = await prisma.commission.findMany({
      include: {
        merchant: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
            customerName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ commissions })
  } catch (error) {
    console.error("Error in GET /api/admin/commissions:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ commissions: [] })
    }

    return NextResponse.json({ error: "Erreur lors de la récupération des commissions" }, { status: 500 })
  }
}

