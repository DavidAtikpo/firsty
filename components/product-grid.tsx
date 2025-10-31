"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/hooks/use-language"
import { ProductCard } from "./product-card"
import { Button } from "../components/ui/button"
import { translateCategoryObject } from "@/lib/client-translations"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  images?: string[]
  category: string
  inStock: boolean
  rating: number
  reviews: number
  brand?: string
  views?: number
  vendor?: {
    storeName: string
  }
  // Champs de traduction (optionnels pour compatibilité)
  name_fr?: string
  name_en?: string
  name_de?: string
  name_es?: string
  description_fr?: string
  description_en?: string
  description_de?: string
  description_es?: string
}

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  count?: number
}

export function ProductGrid() {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [selectedCategory, language])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const categoriesData = await response.json()
        // Traduire les catégories
        const translatedCategories = categoriesData.map((category: any) => 
          translateCategoryObject(category, language)
        )
        setCategories(translatedCategories)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }


  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      // Filtrer uniquement les produits actifs
      params.append('active', 'true')
      // Ajouter le filtre de catégorie si sélectionné
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      // Limiter à 12 produits
      params.append('limit', '12')
      
      const response = await fetch(`/api/products?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // Mapper les produits de l'API vers le format attendu
        const products = (data.products || []).map((product: any) => ({
          ...product,
          inStock: product.stock !== undefined ? product.stock > 0 : (product.inStock ?? true),
          rating: product.rating ?? 4.5,
          reviews: product.reviews ?? 0,
          // Préserver null/undefined pour que getValidImageUrl gère correctement
          image: product.image ?? null,
          // Mapper categoryId vers category pour compatibilité
          category: product.categoryId || product.category,
        }))
        
        setProducts(products)
      } else {
        throw new Error('Erreur lors du chargement des produits')
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error)
      setError("Impossible de charger les produits")
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour obtenir le nom de la catégorie
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : categoryId
  }

  if (error) {
    return (
      <section className="py-4 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t("products")}</h2>
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={fetchProducts}>{t("retry")}</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-2 px-2 md:py-4 md:px-4">
      <div className="container mx-auto">
        <h2 className="text-lg md:text-3xl font-bold text-center mb-1 md:mb-2">{t("products")}</h2>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-4 md:mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            size="sm"
            className="text-xs md:text-sm h-6 md:h-9 px-2 md:px-4"
          >
{t("allProducts")}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
              className="text-xs md:text-sm h-6 md:h-9 px-2 md:px-4"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-6 md:py-12">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm md:text-base">{t("loadingProducts")}</span>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-6 md:py-12 text-muted-foreground text-sm md:text-base">
{t("noProductsFound")}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
