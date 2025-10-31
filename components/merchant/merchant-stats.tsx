import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, ShoppingCart, TrendingUp, Percent } from "lucide-react"

interface MerchantStatsProps {
  totalEarnings: number
  pendingEarnings: number
  totalOrders: number
  totalRevenue: number
  commissionRate: number
}

export function MerchantStats({
  totalEarnings,
  pendingEarnings,
  totalOrders,
  totalRevenue,
  commissionRate,
}: MerchantStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const stats = [
    {
      title: "Gains totaux",
      value: formatCurrency(totalEarnings),
      icon: Euro,
      description: "Commissions payées",
    },
    {
      title: "Gains en attente",
      value: formatCurrency(pendingEarnings),
      icon: TrendingUp,
      description: "À recevoir",
    },
    {
      title: "Commandes référées",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      description: "Total des ventes",
    },
    {
      title: "Taux de commission",
      value: `${commissionRate}%`,
      icon: Percent,
      description: `Revenu total: ${formatCurrency(totalRevenue)}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
