"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Euro, CheckCircle, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface Notification {
  id: string
  type: "new_commission" | "paid"
  message: string
  amount: number
  orderNumber: string
  createdAt: string
  isPaid: boolean
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/merchants/notifications")
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Utiliser la fonction utilitaire formatCurrency

  const formatDate = (date: string) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000)

    if (diffInSeconds < 60) return "Il y a quelques secondes"
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minute(s)`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heure(s)`
    return `Il y a ${Math.floor(diffInSeconds / 86400)} jour(s)`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const unreadCount = notifications.filter((n) => !n.isPaid).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications récentes
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Vos dernières commissions et paiements</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune notification récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg ${
                  !notification.isPaid ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    notification.isPaid ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                  }`}>
                    {notification.isPaid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Euro className="h-3 w-3" />
                      <span>{formatCurrency(notification.amount)}</span>
                      <span>•</span>
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>
                  </div>
                  {!notification.isPaid && (
                    <Badge variant="secondary" className="text-xs">
                      En attente
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

