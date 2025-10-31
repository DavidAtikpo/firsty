"use client"

import { ProductCard } from "./product-card"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string | null
  stock: number
  isActive: boolean
}

interface ProductGridProps {
  products: Product[]
  onAddToCart?: (productId: string) => void
  showActions?: boolean
}

export function ProductGrid({ products, onAddToCart, showActions }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun produit disponible</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} showActions={showActions} />
      ))}
    </div>
  )
}
