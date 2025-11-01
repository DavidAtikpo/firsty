import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ payments: [] })
    }

    const session = await getSession()

    if (!session || session.role !== "MERCHANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const merchant = await prisma.merchant.findUnique({
      where: session.merchantId ? { id: session.merchantId } : { userId: session.id },
      include: {
        commissions: {
          where: { isPaid: true },
          include: {
            order: {
              select: {
                orderNumber: true,
                totalAmount: true,
                customerName: true,
              },
            },
          },
          orderBy: {
            paidAt: "desc",
          },
        },
      },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ payments: merchant.commissions })
  } catch (error) {
    console.error("Error in GET /api/merchants/payments:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ payments: [] })
    }

    return NextResponse.json({ error: "Erreur lors de la récupération des paiements" }, { status: 500 })
  }
}

