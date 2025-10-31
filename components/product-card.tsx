"use client"

import { useLanguage } from "@/hooks/use-language"
import { useCart, type Product } from "@/hooks/use-cart"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Star, ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { translateProductName } from "@/lib/product-translations"
import { getValidImageUrl } from "@/lib/image-validation"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  
  // Utiliser les traductions des noms de produits
  const translatedProductName = translateProductName(product.name, language)

  const handleAddToCart = () => {
    // Adapter pour gérer stock/isActive vs inStock
    const inStock = product.inStock ?? (product.stock !== undefined ? product.stock > 0 : true)
    if (inStock && (product.isActive !== false)) {
      // Mapper les champs pour useCart
      const cartProduct = {
        ...product,
        inStock,
        rating: product.rating ?? 4.5,
        reviews: product.reviews ?? 0,
      }
      addToCart(cartProduct)
    }
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-square relative">
        {product.image && product.image.startsWith("data:image") ? (
          <img
            src={product.image}
            alt={translatedProductName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target.src !== "/placeholder.svg") {
                target.src = "/placeholder.svg"
              }
            }}
          />
        ) : (
          <Image
            src={getValidImageUrl(product.image || null)}
            alt={translatedProductName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target.src !== "/placeholder.svg") {
                target.src = "/placeholder.svg"
              }
            }}
          />
        )}
        {(!product.inStock && (product.stock === undefined || product.stock > 0)) || (product.stock !== undefined && product.stock === 0) && (
          <Badge variant="destructive" className="absolute top-1 right-1 text-[8px] py-0 px-1">
            {t("outOfStockShort")}
          </Badge>
        )}
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" />
      </div>
      
      <div className="p-2">
        <h3 className="text-[10px] md:text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">{translatedProductName}</h3>
        
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-2 w-2 md:h-3 md:w-3 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-[8px] md:text-xs text-gray-500">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] md:text-base font-bold text-primary">€{product.price.toFixed(2)}</span>
          <Badge variant={(product.inStock ?? (product.stock !== undefined ? product.stock > 0 : true)) ? "default" : "secondary"} className="text-[8px] md:text-xs py-0 px-1 md:py-1 md:px-2">
            {(product.inStock ?? (product.stock !== undefined ? product.stock > 0 : true)) ? t("inStockShort") : t("outOfStockShort")}
          </Badge>
        </div>

        <div className="flex gap-1">
          <Button 
            onClick={handleAddToCart} 
            disabled={!product.inStock && (product.stock === undefined || product.stock === 0) || product.isActive === false} 
            className="flex-1 h-6 md:h-8 text-[8px] md:text-xs px-1 md:px-2"
            size="sm"
          >
            <ShoppingCart className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
{t("cartShort")}
          </Button>
          <Link href={`/products/${product.id}`}>
            <Button variant="outline" size="sm" className="h-6 w-6 md:h-8 md:w-8 p-0">
              <Eye className="h-2.5 w-2.5 md:h-3 md:w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
