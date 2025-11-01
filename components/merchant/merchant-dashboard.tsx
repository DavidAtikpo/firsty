"use client"

import { useEffect, useState } from "react"
import { AffiliateLinkGenerator } from "@/components/affiliate/affiliate-link-generator"
import { MerchantStats } from "./merchant-stats"
import { RecentOrders } from "./recent-orders"
import { PaymentHistory } from "./payment-history"
import { PeriodFilter } from "./period-filter"
import { RevenueChart } from "./revenue-chart"
import { Notifications } from "./notifications"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Download } from "lucide-react"

interface Stats {
  affiliateCode: string
  commissionRate: number
  totalEarnings: number
  pendingEarnings: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue?: number
  averageCommission?: number
  recentOrders30Days?: number
  recentRevenue30Days?: number
  recentCommissions30Days?: number
  uniqueCustomers?: number
  averageRevenuePerCustomer?: number
  totalClicks?: number
  convertedClicks?: number
  conversionRate?: number
  recentClicksCount?: number
  recentConvertedClicks?: number
  recentConversionRate?: number
  recentOrders: any[]
  pendingCommissions: any[]
}

export function MerchantDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<number | null>(null)

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      const url = period ? `/api/merchants/stats?period=${period}` : "/api/merchants/stats"
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (days: number | null) => {
    setPeriod(days)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Erreur lors du chargement des données</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tableau de bord Commerçant</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/api/merchants/export?type=stats", "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-semibold">Statistiques</h2>
          <PeriodFilter onPeriodChange={handlePeriodChange} />
        </div>
        
        <MerchantStats
          totalEarnings={stats.totalEarnings}
          pendingEarnings={stats.pendingEarnings}
          totalOrders={stats.totalOrders}
          totalRevenue={stats.totalRevenue}
          commissionRate={stats.commissionRate}
          averageOrderValue={stats.averageOrderValue}
          averageCommission={stats.averageCommission}
          recentOrders30Days={stats.recentOrders30Days}
          recentRevenue30Days={stats.recentRevenue30Days}
          recentCommissions30Days={stats.recentCommissions30Days}
          uniqueCustomers={stats.uniqueCustomers}
          averageRevenuePerCustomer={stats.averageRevenuePerCustomer}
          totalClicks={stats.totalClicks}
          convertedClicks={stats.convertedClicks}
          conversionRate={stats.conversionRate}
          recentClicksCount={stats.recentClicksCount}
          recentConvertedClicks={stats.recentConvertedClicks}
          recentConversionRate={stats.recentConversionRate}
        />

        <AffiliateLinkGenerator affiliateCode={stats.affiliateCode} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <Notifications />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentOrders orders={stats.recentOrders} />
          <PaymentHistory />
        </div>
      </main>
    </div>
  )
}
