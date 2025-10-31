import { ShopInterface } from "@/components/shop/shop-interface"
import { Suspense } from "react"

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ShopInterface />
    </Suspense>
  )
}
