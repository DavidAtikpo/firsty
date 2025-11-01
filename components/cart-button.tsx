"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import Link from "next/link"
import Image from "next/image"
import { getValidImageUrl } from "@/lib/image-validation"
import { formatCurrency } from "@/lib/currency"

export function CartButton() {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Car className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Panier ({totalItems} {totalItems > 1 ? "articles" : "article"})
          </SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? "Votre panier est vide"
              : `${cart.length} ${cart.length > 1 ? "produits" : "produit"} dans votre panier`}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Votre panier est vide</p>
            <p className="text-sm text-muted-foreground mb-6">Commencez vos achats pour remplir votre panier</p>
            <Link href="/shop">
              <Button className="w-full sm:w-auto">Continuer les achats</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {cart.map((item) => {
                const productImage = item.product.image
                  ? getValidImageUrl(item.product.image)
                  : "/placeholder.svg"

                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Image du produit */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {productImage && productImage.startsWith("data:image") ? (
                        <img
                          src={productImage}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (target.src !== "/placeholder.svg") {
                              target.src = "/placeholder.svg"
                            }
                          }}
                        />
                      ) : (
                        <Image
                          src={productImage}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 80px, 96px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (target.src !== "/placeholder.svg") {
                              target.src = "/placeholder.svg"
                            }
                          }}
                        />
                      )}
                    </div>

                    {/* Informations du produit */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base line-clamp-2">{item.product.name}</h4>
                          <p className="text-sm font-semibold text-primary mt-1">
                            {formatCurrency(item.product.price)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => removeFromCart(item.product.id)}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      {/* Contrôle de quantité */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="px-3 py-1 min-w-[2.5rem] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold ml-auto">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Résumé et actions */}
            <div className="border-t pt-4 space-y-4 mt-auto">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/shop" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Continuer les achats
                  </Button>
                </Link>
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">Commander</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

