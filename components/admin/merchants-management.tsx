"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"

interface Merchant {
  id: string
  affiliateCode: string
  commissionRate: number
  totalEarnings: number
  pendingEarnings: number
  user: {
    name: string
    email: string
  }
  _count: {
    referrals: number
  }
}

export function MerchantsManagement() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const response = await fetch("/api/admin/merchants")
      const data = await response.json()

      if (response.ok) {
        setMerchants(data.merchants)
      }
    } catch (error) {
      console.error("Error fetching merchants:", error)
    } finally {
      setLoading(false)
    }
  }

  // Utiliser la fonction utilitaire formatCurrency

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des commerçants</CardTitle>
        <CardDescription>Vue d'ensemble de tous les commerçants affiliés</CardDescription>
      </CardHeader>
      <CardContent>
        {merchants.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun commerçant</p>
        ) : (
          <div className="space-y-4">
            {merchants.map((merchant) => (
              <Card key={merchant.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{merchant.user.name}</CardTitle>
                      <CardDescription>{merchant.user.email}</CardDescription>
                    </div>
                    <Badge variant="secondary">{merchant.affiliateCode}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de commission</p>
                      <p className="text-lg font-semibold">{merchant.commissionRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gains totaux</p>
                      <p className="text-lg font-semibold">{formatCurrency(merchant.totalEarnings)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gains en attente</p>
                      <p className="text-lg font-semibold">{formatCurrency(merchant.pendingEarnings)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ventes référées</p>
                      <p className="text-lg font-semibold">{merchant._count.referrals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
