import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ notifications: [] })
    }

    const session = await getSession()

    if (!session || session.role !== "MERCHANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const merchant = await prisma.merchant.findUnique({
      where: session.merchantId ? { id: session.merchantId } : { userId: session.id },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant non trouvé" }, { status: 404 })
    }

    // Récupérer les nouvelles commissions (non lues - créées dans les dernières 7 jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentCommissions = await prisma.commission.findMany({
      where: {
        merchantId: merchant.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
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
        createdAt: "desc",
      },
      take: 10, // Limiter à 10 dernières notifications
    })

    // Formater les notifications
    const notifications = recentCommissions.map((commission) => ({
      id: commission.id,
      type: commission.isPaid ? "paid" : "new_commission",
      message: commission.isPaid
        ? `Commission de ${commission.amount.toFixed(2)}€ payée pour la commande ${commission.order.orderNumber}`
        : `Nouvelle commission de ${commission.amount.toFixed(2)}€ pour la commande ${commission.order.orderNumber}`,
      amount: commission.amount,
      orderNumber: commission.order.orderNumber,
      createdAt: commission.createdAt,
      isPaid: commission.isPaid,
    }))

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error in GET /api/merchants/notifications:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ notifications: [] })
    }

    return NextResponse.json({ error: "Erreur lors de la récupération des notifications" }, { status: 500 })
  }
}

