"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Payment {
  id: string
  amount: number
  commissionRate: number
  paidAt: string
  createdAt: string
  order: {
    orderNumber: string
    totalAmount: number
    customerName: string
  }
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/merchants/payments")
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = ["Date de paiement", "Numéro de commande", "Client", "Montant commande", "Taux", "Commission"]
    const rows = payments.map((payment) => [
      formatDate(payment.paidAt),
      payment.order.orderNumber,
      payment.order.customerName,
      formatCurrency(payment.order.totalAmount),
      `${payment.commissionRate}%`,
      formatCurrency(payment.amount),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `paiements_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historique des paiements</CardTitle>
            <CardDescription>Toutes vos commissions payées</CardDescription>
          </div>
          {payments.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun paiement pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Total payé</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</span>
            </div>

            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{payment.order.orderNumber}</p>
                      <Badge variant="default" className="bg-green-600">Payé</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Client: {payment.order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Paié le {formatDate(payment.paidAt)}
                    </p>
                  </div>
                  <div className="text-right space-y-1 ml-4">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.commissionRate}% sur {formatCurrency(payment.order.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

