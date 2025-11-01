"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { Header } from "@/components/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { getValidImageUrl } from "@/lib/image-validation"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, totalPrice, clearCart } = useCart()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  // Formulaire
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setIsAuthenticated(true)
            // Pré-remplir avec les données de l'utilisateur si disponibles
            if (data.user.name) setCustomerName(data.user.name)
            if (data.user.email) setCustomerEmail(data.user.email)
          } else {
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  // Rediriger si panier vide
  useEffect(() => {
    if (cart.length === 0 && !submitting && !success) {
      router.push("/shop")
    }
  }, [cart, submitting, success, router])

  // Utiliser la fonction utilitaire formatCurrency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

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
        setSubmitting(false)
        return
      }

      // Succès !
      setSuccess(true)
      setOrderNumber(data.order?.orderNumber || "")
      clearCart()
      
      toast({
        title: "Commande réussie !",
        description: `Votre commande ${data.order?.orderNumber || ""} a été créée avec succès.`,
      })

      // Rediriger vers la page des commandes après 3 secondes
      setTimeout(() => {
        router.push("/orders")
      }, 3000)
    } catch (err) {
      setError("Une erreur est survenue lors de la création de la commande")
      setSubmitting(false)
    }
  }

  // États de chargement
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  // Non authentifié - rediriger vers login
  if (isAuthenticated === false) {
    router.push("/login?redirect=/checkout")
    return null
  }

  // Panier vide
  if (cart.length === 0 && !success) {
    return null // Le useEffect redirigera
  }

  // Page de succès
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Commande confirmée !</CardTitle>
              <CardDescription className="text-base">
                Votre commande a été créée avec succès
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderNumber && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Numéro de commande</p>
                  <p className="text-xl font-bold">{orderNumber}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Un email de confirmation a été envoyé à {customerEmail}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection vers vos commandes...
              </p>
              <Button onClick={() => router.push("/orders")} className="w-full">
                Voir mes commandes
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/shop")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la boutique
          </Button>
          <h1 className="text-3xl font-bold mb-2">Finaliser la commande</h1>
          <p className="text-muted-foreground">
            Complétez vos informations pour finaliser votre achat
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de livraison</CardTitle>
                <CardDescription>
                  Entrez vos coordonnées pour la livraison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      disabled={submitting}
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      disabled={submitting}
                      placeholder="jean.dupont@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse de livraison *</Label>
                    <Textarea
                      id="address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      disabled={submitting}
                      rows={4}
                      placeholder="123 Rue de la Paix&#10;75001 Paris&#10;France"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Erreur</p>
                        <p className="text-sm text-destructive/80">{error}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting || cart.length === 0}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Confirmer la commande
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Liste des produits */}
                <div className="space-y-3">
                  {cart.map((item) => {
                    const productImage = item.product.image
                      ? getValidImageUrl(item.product.image)
                      : "/placeholder.svg"

                    return (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {productImage && productImage.startsWith("data:image") ? (
                            <img
                              src={productImage}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={productImage}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qté: {item.quantity} × {formatCurrency(item.product.price)}
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Totaux */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  Vous serez redirigé vers la page de paiement après confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

