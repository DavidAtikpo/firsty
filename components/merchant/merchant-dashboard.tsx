"use client"

import { useEffect, useState } from "react"
import { AffiliateLinkGenerator } from "@/components/affiliate/affiliate-link-generator"
import { MerchantStats } from "./merchant-stats"
import { RecentOrders } from "./recent-orders"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Stats {
  affiliateCode: string
  commissionRate: number
  totalEarnings: number
  pendingEarnings: number
  totalOrders: number
  totalRevenue: number
  recentOrders: any[]
  pendingCommissions: any[]
}

export function MerchantDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/merchants/stats")
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
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <MerchantStats
          totalEarnings={stats.totalEarnings}
          pendingEarnings={stats.pendingEarnings}
          totalOrders={stats.totalOrders}
          totalRevenue={stats.totalRevenue}
          commissionRate={stats.commissionRate}
        />

        <AffiliateLinkGenerator affiliateCode={stats.affiliateCode} />

        <RecentOrders orders={stats.recentOrders} />
      </main>
    </div>
  )
}
