"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Star, Shield, Truck, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getValidImageUrl } from "@/lib/image-validation"
// import { translateProductName } from "@/lib/product-translations"
// import { useLanguage } from "@/hooks/use-language"

interface Product {
  id: string
  name: string
  price: number
  image: string
  inStock: boolean
  rating: number
  reviews: number
}

export function HeroSection() {
  // const { language } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?active=true')
        if (response.ok) {
          const data = await response.json()
          // Mapper les produits de l'API vers le format attendu
          const mappedProducts = (data.products || [])
            .slice(0, 6) // Limiter à 6 produits
            .map((product: any) => ({
              ...product,
              // Préserver null/undefined pour que le composant Image gère correctement
              image: product.image ?? null,
              inStock: product.stock !== undefined ? product.stock > 0 : true,
              rating: product.rating ?? 4.5,
              reviews: product.reviews ?? 0,
            }))
          setProducts(mappedProducts)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Défilement automatique
  useEffect(() => {
    if (products.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
    }, 4000) // Change toutes les 4 secondes

    return () => clearInterval(interval)
  }, [products.length])

  const nextProduct = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
  }

  const prevProduct = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length)
  }

  const currentProduct = products[currentIndex]

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-3 md:py-6 overflow-hidden">
      {/* Background decoration - minimal */}
      <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500/10 rounded-full blur-xl md:w-16 md:h-16 md:top-4 md:right-4"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 bg-purple-500/20 rounded-full blur-lg md:w-12 md:h-12 md:bottom-4 md:left-4"></div>
      
      <div className="container mx-auto px-3 relative z-10">
        <div className="grid lg:grid-cols-2 gap-3 md:gap-6 items-center">
          {/* Left content - ultra compact mobile */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium mb-2">
              <Star className="h-2.5 w-2.5 fill-current" />
              <span className="text-xs">Qualité Premium</span>
            </div>
            
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight">
              Découvrez nos produits d'exception
            </h1>
            
            <p className="text-xs md:text-base text-gray-600 mb-3 md:mb-4 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Une sélection unique de produits haut de gamme pour transformer votre quotidien.
            </p>
      
          </div>
          
          {/* Right content - Product carousel */}
          <div className="relative mt-3 lg:mt-0">
            {loading ? (
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 md:p-6">
                <div className="relative aspect-square w-full max-w-[250px] md:max-w-sm mx-auto">
                  <div className="relative bg-white rounded-lg p-1 md:p-2 shadow-lg flex items-center justify-center h-full">
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center animate-pulse">
                      <Zap className="h-6 w-6 md:h-10 md:w-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ) : currentProduct ? (
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 md:p-6">
                <Link href={`/products/${currentProduct.id}`}>
                  <div className="relative aspect-square w-full max-w-[250px] md:max-w-sm mx-auto group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                    <div className="relative bg-white rounded-lg p-1 md:p-2 shadow-lg group-hover:shadow-xl transition-all duration-300 h-full">
                      {currentProduct.image && currentProduct.image.startsWith("data:image") ? (
                        <img
                          src={currentProduct.image}
                          alt={currentProduct.name}
                          className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Image
                          src={currentProduct.image ? getValidImageUrl(currentProduct.image) : "/placeholder.svg"}
                          alt={currentProduct.name}
                          fill
                          sizes="(max-width: 768px) 250px, 400px"
                          className="object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                          priority
                        />
                      )}
                    </div>
                  </div>
                </Link>
                
                {/* Product info */}
                <div className="mt-2 text-center">
                  <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {currentProduct.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-2 w-2 md:h-3 md:w-3 ${
                            i < Math.floor(currentProduct.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[8px] md:text-xs text-gray-500">({currentProduct.reviews})</span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-blue-600">€{currentProduct.price.toFixed(2)}</p>
                </div>
                
                {/* Navigation buttons */}
                {products.length > 1 && (
                  <>
                    <button
                      onClick={prevProduct}
                      className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md transition-all duration-200"
                    >
                      <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={nextProduct}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md transition-all duration-200"
                    >
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                    </button>
                  </>
                )}
                
                {/* Dots indicator */}
                {products.length > 1 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-200 ${
                          index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 md:p-6">
                <div className="relative aspect-square w-full max-w-[250px] md:max-w-sm mx-auto">
                  <div className="relative bg-white rounded-lg p-1 md:p-2 shadow-lg flex items-center justify-center h-full">
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                      <Zap className="h-6 w-6 md:h-10 md:w-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats cards - hidden on mobile, show on lg+ */}
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 hidden xl:block">
              <div className="bg-white rounded-lg shadow-lg p-2 text-center min-w-[60px]">
                <div className="text-lg font-bold text-blue-600">4.9</div>
                <div className="text-xs text-gray-500">★★★★★</div>
              </div>
            </div>
            
            <div className="absolute -left-2 top-1/4 hidden xl:block">
              <div className="bg-white rounded-lg shadow-lg p-2 text-center min-w-[60px]">
                <div className="text-lg font-bold text-green-600">50k+</div>
                <div className="text-xs text-gray-500">Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}