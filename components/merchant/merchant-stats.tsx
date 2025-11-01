import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, ShoppingCart, TrendingUp, Percent, Users, Calendar, TrendingDown, MousePointerClick, Target } from "lucide-react"

interface MerchantStatsProps {
  totalEarnings: number
  pendingEarnings: number
  totalOrders: number
  totalRevenue: number
  commissionRate: number
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
}

export function MerchantStats({
  totalEarnings,
  pendingEarnings,
  totalOrders,
  totalRevenue,
  commissionRate,
  averageOrderValue = 0,
  averageCommission = 0,
  recentOrders30Days = 0,
  recentRevenue30Days = 0,
  recentCommissions30Days = 0,
  uniqueCustomers = 0,
  averageRevenuePerCustomer = 0,
  totalClicks = 0,
  convertedClicks = 0,
  conversionRate = 0,
  recentClicksCount = 0,
  recentConvertedClicks = 0,
  recentConversionRate = 0,
}: MerchantStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const primaryStats = [
    {
      title: "Gains totaux",
      value: formatCurrency(totalEarnings),
      icon: Euro,
      description: "Commissions payées",
      color: "text-green-600",
    },
    {
      title: "Gains en attente",
      value: formatCurrency(pendingEarnings),
      icon: TrendingUp,
      description: "À recevoir",
      color: "text-orange-600",
    },
    {
      title: "Commandes référées",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      description: `Revenu total: ${formatCurrency(totalRevenue)}`,
      color: "text-blue-600",
    },
    {
      title: "Taux de commission",
      value: `${commissionRate}%`,
      icon: Percent,
      description: `Gains moyens: ${formatCurrency(averageCommission)}`,
      color: "text-purple-600",
    },
  ]

  const secondaryStats = [
    {
      title: "Taux de conversion",
      value: `${conversionRate.toFixed(2)}%`,
      icon: Target,
      description: `${convertedClicks} commandes sur ${totalClicks} clics`,
      color: conversionRate >= 5 ? "text-green-600" : conversionRate >= 2 ? "text-yellow-600" : "text-red-600",
    },
    {
      title: "Panier moyen",
      value: formatCurrency(averageOrderValue),
      icon: ShoppingCart,
      description: "Par commande",
    },
    {
      title: "30 derniers jours",
      value: recentOrders30Days.toString(),
      icon: Calendar,
      description: `${formatCurrency(recentRevenue30Days)} • ${formatCurrency(recentCommissions30Days)} commissions`,
    },
    {
      title: "Clics (30j)",
      value: recentClicksCount.toString(),
      icon: MousePointerClick,
      description: `${recentConvertedClicks} convertis • ${recentConversionRate.toFixed(2)}% taux`,
    },
  ]

  const tertiaryStats = [
    {
      title: "Clients uniques",
      value: uniqueCustomers.toString(),
      icon: Users,
      description: `Revenu moyen: ${formatCurrency(averageRevenuePerCustomer)}`,
    },
    {
      title: "Commission moyenne",
      value: formatCurrency(averageCommission),
      icon: TrendingDown,
      description: "Par commande",
    },
    {
      title: "Total clics",
      value: totalClicks.toString(),
      icon: MousePointerClick,
      description: `${convertedClicks} convertis en commandes`,
    },
    {
      title: "Conversion (30j)",
      value: `${recentConversionRate.toFixed(2)}%`,
      icon: Target,
      description: `${recentConvertedClicks}/${recentClicksCount} clics convertis`,
      color: recentConversionRate >= 5 ? "text-green-600" : recentConversionRate >= 2 ? "text-yellow-600" : "text-red-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-muted/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${stat.color || ""}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Statistiques tertiaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tertiaryStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-muted/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-bold ${stat.color || ""}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
