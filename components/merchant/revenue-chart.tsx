"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface DailyRevenue {
  date: string
  revenue: number
  commissions: number
  orders: number
}

export function RevenueChart() {
  const [data, setData] = useState<DailyRevenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const response = await fetch("/api/merchants/chart-data")
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus</CardTitle>
          <CardDescription>Revenus générés sur les 30 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus</CardTitle>
          <CardDescription>Revenus générés sur les 30 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Évolution des revenus
        </CardTitle>
        <CardDescription>Revenus générés sur les 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Graphique en barres simples */}
          <div className="h-64 flex items-end gap-1 pb-8">
            {data.map((day, index) => {
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80 relative"
                    style={{ height: `${height}%` }}
                    title={`${new Date(day.date).toLocaleDateString("fr-FR")}: ${formatCurrency(day.revenue)}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-md border">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 rotate-45 origin-top-left whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Statistiques résumées */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Revenu total</p>
              <p className="text-lg font-bold">
                {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Commissions</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(data.reduce((sum, d) => sum + d.commissions, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Commandes</p>
              <p className="text-lg font-bold">
                {data.reduce((sum, d) => sum + d.orders, 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

