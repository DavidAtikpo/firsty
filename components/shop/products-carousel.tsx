"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { formatCurrency } from "@/lib/currency"

interface Product {
  id: string
  name: string
  image: string | null
  price: number
}

interface ProductsCarouselProps {
  products: Product[]
}

export function ProductsCarousel({ products }: ProductsCarouselProps) {
  // Utiliser la fonction utilitaire formatCurrency

  if (products.length === 0) return null

  // Dupliquer les produits pour l'effet de défilement infini
  const displayedProducts = [...products, ...products]

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex animate-scroll gap-3 sm:gap-4">
        {displayedProducts.map((product, index) => (
          <Link
            key={`${product.id}-${index}`}
            href={`/shop?product=${product.id}`}
            className="flex-shrink-0"
          >
            <Card className="w-32 sm:w-40 md:w-48 p-0 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-muted">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">Pas d'image</span>
                  </div>
                )}
              </div>
              <div className="p-2 sm:p-3">
                <h4 className="text-xs sm:text-sm font-medium line-clamp-1 mb-1">{product.name}</h4>
                <p className="text-xs sm:text-sm font-bold text-primary">{formatCurrency(product.price)}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

