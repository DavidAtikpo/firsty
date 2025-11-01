import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  items: any[]
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  // Utiliser la fonction utilitaire formatCurrency

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "default"
      case "SHIPPED":
        return "secondary"
      case "PROCESSING":
        return "outline"
      case "CANCELLED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente"
      case "PROCESSING":
        return "En traitement"
      case "SHIPPED":
        return "Expédié"
      case "DELIVERED":
        return "Livré"
      case "CANCELLED":
        return "Annulé"
      default:
        return status
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
          <CardDescription>Vos dernières ventes référées</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Aucune commande pour le moment</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
        <CardDescription>Vos dernières ventes référées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                <p className="text-xs text-muted-foreground">{order.items.length} article(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
