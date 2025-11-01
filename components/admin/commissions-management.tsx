"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Euro, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Commission {
  id: string
  amount: number
  commissionRate: number
  isPaid: boolean
  createdAt: string
  paidAt: string | null
  merchant: {
    id: string
    affiliateCode: string
    user: {
      name: string
      email: string
    }
  }
  order: {
    orderNumber: string
    totalAmount: number
    createdAt: string
    customerName: string
  }
}

export function CommissionsManagement() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all")

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      const response = await fetch("/api/admin/commissions")
      const data = await response.json()

      if (response.ok) {
        setCommissions(data.commissions || [])
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors du chargement des commissions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching commissions:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des commissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePaid = async (commissionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: !currentStatus }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: currentStatus
            ? "Commission marquée comme non payée"
            : "Commission marquée comme payée",
        })
        fetchCommissions()
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la mise à jour",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating commission:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la commission",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredCommissions = commissions.filter((commission) => {
    if (filter === "pending") return !commission.isPaid
    if (filter === "paid") return commission.isPaid
    return true
  })

  const totalPending = commissions.filter((c) => !c.isPaid).reduce((sum, c) => sum + c.amount, 0)
  const totalPaid = commissions.filter((c) => c.isPaid).reduce((sum, c) => sum + c.amount, 0)
  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total commissions</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{commissions.length} commission(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {commissions.filter((c) => !c.isPaid).length} non payée(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payées</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {commissions.filter((c) => c.isPaid).length} payée(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des commissions</CardTitle>
          <CardDescription>Marquez les commissions comme payées lorsqu'elles sont versées aux commerçants</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "pending" | "paid")}>
            <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="paid">Payées</TabsTrigger>
            </TabsList>

            {filteredCommissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {filter === "all"
                    ? "Aucune commission pour le moment"
                    : filter === "pending"
                      ? "Aucune commission en attente"
                      : "Aucune commission payée"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCommissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{commission.order.orderNumber}</p>
                        <Badge variant={commission.isPaid ? "default" : "secondary"}>
                          {commission.isPaid ? "Payée" : "En attente"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Commerçant:</span> {commission.merchant.user.name}
                        </div>
                        <div>
                          <span className="font-medium">Code:</span> {commission.merchant.affiliateCode}
                        </div>
                        <div>
                          <span className="font-medium">Client:</span> {commission.order.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(commission.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant commande:</span>{" "}
                          <span className="font-medium">{formatCurrency(commission.order.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Taux:</span>{" "}
                          <span className="font-medium">{commission.commissionRate}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Commission:</span>{" "}
                          <span className="font-bold text-primary">{formatCurrency(commission.amount)}</span>
                        </div>
                        {commission.isPaid && commission.paidAt && (
                          <div>
                            <span className="text-muted-foreground">Payée le:</span>{" "}
                            <span className="font-medium">{formatDate(commission.paidAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button
                        variant={commission.isPaid ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePaid(commission.id, commission.isPaid)}
                      >
                        {commission.isPaid ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Annuler paiement
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Marquer payée
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

