import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "MERCHANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const merchant = await prisma.merchant.findUnique({
      where: session.merchantId ? { id: session.merchantId } : { userId: session.id },
      include: {
        referrals: {
          include: {
            items: true,
          },
        },
        commissions: {
          where: { isPaid: false },
        },
      },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant non trouvé" }, { status: 404 })
    }

    const totalOrders = merchant.referrals.length
    const totalRevenue = merchant.referrals.reduce((sum, order) => sum + order.totalAmount, 0)

    const stats = {
      affiliateCode: merchant.affiliateCode,
      commissionRate: merchant.commissionRate,
      totalEarnings: merchant.totalEarnings,
      pendingEarnings: merchant.pendingEarnings,
      totalOrders,
      totalRevenue,
      recentOrders: merchant.referrals.slice(0, 10),
      pendingCommissions: merchant.commissions,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
  }
}
