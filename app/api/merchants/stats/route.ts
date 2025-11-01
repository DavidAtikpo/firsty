import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ stats: null })
    }

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
        clicks: true,
      },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant non trouvé" }, { status: 404 })
    }

    // Récupérer le paramètre de période (optionnel)
    const { searchParams } = new URL(request.url)
    const periodDays = searchParams.get("period") ? parseInt(searchParams.get("period")!) : null
    
    // Date de début pour le filtre (si période spécifiée)
    let periodStartDate: Date | null = null
    if (periodDays) {
      periodStartDate = new Date()
      periodStartDate.setDate(periodStartDate.getDate() - periodDays)
    }

    // Statistiques globales
    const allOrders = periodDays
      ? merchant.referrals.filter(order => !periodStartDate || new Date(order.createdAt) >= periodStartDate)
      : merchant.referrals
    
    const totalOrders = allOrders.length
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalCommissions = merchant.totalEarnings + merchant.pendingEarnings
    const averageCommission = allOrders.length > 0 ? totalCommissions / allOrders.length : 0

    // Statistiques des 30 derniers jours (toujours calculées)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentOrders = merchant.referrals.filter(order => new Date(order.createdAt) >= thirtyDaysAgo)
    const recentRevenue = recentOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const recentCommissions = recentOrders.reduce((sum, order) => {
      const commission = order.totalAmount * (merchant.commissionRate / 100)
      return sum + commission
    }, 0)

    // Clients uniques
    const uniqueCustomers = new Set(allOrders.map(order => order.customerId)).size
    const averageRevenuePerCustomer = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0

    // Statistiques des clics
    const allClicks = periodDays
      ? merchant.clicks.filter(click => !periodStartDate || new Date(click.createdAt) >= periodStartDate)
      : merchant.clicks
    
    const totalClicks = allClicks.length
    const convertedClicks = allClicks.filter(click => click.converted).length
    const conversionRate = totalClicks > 0 ? (convertedClicks / totalClicks) * 100 : 0
    
    // Clics des 30 derniers jours (toujours calculés)
    const recentClicks = merchant.clicks.filter(click => new Date(click.createdAt) >= thirtyDaysAgo)
    const recentClicksCount = recentClicks.length
    const recentConvertedClicks = recentClicks.filter(click => click.converted).length
    const recentConversionRate = recentClicksCount > 0 ? (recentConvertedClicks / recentClicksCount) * 100 : 0

    // Commandes par statut
    const ordersByStatus = merchant.referrals.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const stats = {
      affiliateCode: merchant.affiliateCode,
      commissionRate: merchant.commissionRate,
      totalEarnings: merchant.totalEarnings,
      pendingEarnings: merchant.pendingEarnings,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      averageCommission,
      recentOrders30Days: recentOrders.length,
      recentRevenue30Days: recentRevenue,
      recentCommissions30Days: recentCommissions,
      uniqueCustomers,
      averageRevenuePerCustomer,
      ordersByStatus,
      // Statistiques de clics
      totalClicks,
      convertedClicks,
      conversionRate,
      recentClicksCount,
      recentConvertedClicks,
      recentConversionRate,
      recentOrders: merchant.referrals.slice(0, 10).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      pendingCommissions: merchant.commissions,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/merchants/stats:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ stats: null })
    }

    return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
  }
}
