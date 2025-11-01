import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ data: [] })
    }

    const session = await getSession()

    if (!session || session.role !== "MERCHANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const merchant = await prisma.merchant.findUnique({
      where: session.merchantId ? { id: session.merchantId } : { userId: session.id },
      include: {
        referrals: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
            },
          },
          include: {
            items: true,
          },
        },
      },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant non trouvé" }, { status: 404 })
    }

    // Grouper les commandes par jour
    const ordersByDay = new Map<string, { revenue: number; commissions: number; orders: number }>()

    // Initialiser les 30 derniers jours avec 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateKey = date.toISOString().split("T")[0]
      ordersByDay.set(dateKey, { revenue: 0, commissions: 0, orders: 0 })
    }

    // Remplir avec les vraies données
    merchant.referrals.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().split("T")[0]
      const existing = ordersByDay.get(dateKey) || { revenue: 0, commissions: 0, orders: 0 }
      existing.revenue += order.totalAmount
      existing.commissions += (order.totalAmount * merchant.commissionRate) / 100
      existing.orders += 1
      ordersByDay.set(dateKey, existing)
    })

    // Convertir en tableau trié par date
    const data = Array.from(ordersByDay.entries())
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in GET /api/merchants/chart-data:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 })
  }
}

