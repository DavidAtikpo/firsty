"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

interface CartItem {
  product: {
    id: string
    name: string
    price: number
    image: string | null
  }
  quantity: number
}

interface ShoppingCartProps {
  cart: CartItem[]
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  onClose: () => void
}

export function ShoppingCart({ cart, updateQuantity, clearCart, onClose }: ShoppingCartProps) {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Utiliser la fonction utilitaire formatCurrency

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customerName,
          customerEmail,
          shippingAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erreur lors de la commande")
        return
      }

      clearCart()
      onClose()
      router.push("/orders")
      router.refresh()
    } catch (err) {
      setError("Erreur lors de la commande")
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <SheetHeader className="mb-8">
          <SheetTitle>Panier</SheetTitle>
          <SheetDescription>Votre panier est vide</SheetDescription>
        </SheetHeader>
      </div>
    )
  }

  if (showCheckout) {
    return (
      <div className="flex flex-col h-full">
        <SheetHeader className="mb-6">
          <SheetTitle>Finaliser la commande</SheetTitle>
          <SheetDescription>Entrez vos informations de livraison</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleCheckout} className="flex-1 flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse de livraison</Label>
              <Textarea
                id="address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                disabled={loading}
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckout(false)}
                disabled={loading}
                className="flex-1"
              >
                Retour
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Commande..." : "Commander"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="mb-6">
        <SheetTitle>Panier ({cart.length})</SheetTitle>
        <SheetDescription>Gérez vos articles</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto space-y-4">
        {cart.map((item) => (
          <div key={item.product.id} className="flex gap-4 p-4 border rounded-lg">
            <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
              {item.product.image ? (
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  Pas d'image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
              <p className="text-sm text-muted-foreground">{formatCurrency(item.product.price)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 ml-auto"
                  onClick={() => updateQuantity(item.product.id, 0)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button onClick={() => setShowCheckout(true)} className="w-full">
          Passer la commande
        </Button>
      </div>
    </div>
  )
}
