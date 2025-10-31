"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import Link from "next/link"

export function CartButton() {
  const { cart, totalItems } = useCart()

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
      <SheetContent>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Panier</h2>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Votre panier est vide</p>
              <Link href="/shop">
                <Button className="mt-4">Continuer les achats</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 border-b pb-4">
                    <div className="w-16 h-16 bg-muted rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {item.product.price.toFixed(2)}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <p className="text-lg font-semibold">
                  Total: {cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}€
                </p>
                <Link href="/shop">
                  <Button className="w-full mt-4">Voir le panier</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

