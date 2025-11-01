"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Facebook,
  Twitter,
  MessageCircle,
  Copy,
  Check,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/hooks/use-cart"
import type { Product as CartProduct } from "@/hooks/use-cart"
import { getValidImageUrl } from "@/lib/image-validation"
import { toast } from "@/hooks/use-toast"
import { ProductGrid } from "@/components/products/product-grid"
import { formatCurrency } from "@/lib/currency"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string | null
  stock: number
  isActive: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Produit non trouvé")
          return
        }

        const productData = data.product
        setProduct(productData)

        // Sauvegarder le produit dans les produits récemment vus
        const recentViewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
        const updatedRecent = [
          productData,
          ...recentViewed.filter((p: Product) => p.id !== productData.id)
        ].slice(0, 8) // Garder seulement les 8 derniers
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedRecent))

        // Charger les produits similaires (autres produits actifs)
        const similarResponse = await fetch("/api/products?active=true")
        if (similarResponse.ok) {
          const similarData = await similarResponse.json()
          const similar = (similarData.products || [])
            .filter((p: Product) => p.id !== productData.id && p.isActive)
            .slice(0, 4) // Limiter à 4 produits similaires
          setSimilarProducts(similar)
        }

        // Charger les produits récemment vus depuis localStorage
        const filteredRecent = updatedRecent
          .filter((p: Product) => p.id !== productData.id)
          .slice(0, 4) // Limiter à 4 produits récents
        setRecentlyViewed(filteredRecent)
      } catch (err) {
        setError("Erreur lors du chargement du produit")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  // Utiliser la fonction utilitaire formatCurrency

  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/products/${product?.id}` : ""
  const productText = `Découvrez ${product?.name} sur Firsty Shop!`

  const handleShare = (platform: string) => {
    if (!productUrl) return

    const encodedUrl = encodeURIComponent(productUrl)
    const encodedText = encodeURIComponent(productText)

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=400")
        break
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, "_blank", "width=600,height=400")
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank")
        break
      case "copy":
        navigator.clipboard.writeText(productUrl)
        setCopied(true)
        toast({
          title: "Lien copié!",
          description: "Le lien du produit a été copié dans le presse-papiers.",
        })
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    toast({
      title: liked ? "Retiré des favoris" : "Ajouté aux favoris",
      description: liked ? "Le produit a été retiré de vos favoris." : "Le produit a été ajouté à vos favoris.",
    })
  }

  const handleAddToCart = () => {
    if (!product) return

    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      inStock: product.stock > 0,
      rating: 4.5,
      reviews: 0,
      description: product.description,
      stock: product.stock,
      isActive: product.isActive,
    }

    // Ajouter la quantité souhaitée
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct)
    }

    toast({
      title: "Produit ajouté",
      description: `${quantity} ${quantity > 1 ? "produits" : "produit"} ajouté${quantity > 1 ? "s" : ""} au panier`,
    })
  }

  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du produit...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Produit non trouvé</h1>
                <p className="text-muted-foreground mb-6">{error || "Le produit que vous recherchez n'existe pas."}</p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button onClick={() => router.push("/shop")}>
                    Voir la boutique
                  </Button>
                </div>
              </div>
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
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-4 md:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-3 text-xs md:text-sm"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Link href="/shop" className="hover:text-foreground">
              Boutique
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Image */}
          <div className="relative w-full flex justify-center">
            <Card className="overflow-hidden max-w-md w-full">
              <div className="relative aspect-square bg-muted w-full max-h-[350px] md:max-h-[400px]">
                {product.image && product.image.startsWith("data:image") ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain bg-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target.src !== "/placeholder.svg") {
                        target.src = "/placeholder.svg"
                      }
                    }}
                  />
                ) : product.image ? (
                  <img
                    src={getValidImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain bg-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target.src !== "/placeholder.svg") {
                        target.src = "/placeholder.svg"
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <img 
                      src="/placeholder.svg" 
                      alt={product.name} 
                      className="w-32 h-32 opacity-50 object-contain" 
                    />
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                    <Badge variant="secondary" className="text-xs">Inactif</Badge>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
                    <Badge variant="destructive" className="text-xs">Rupture de stock</Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-3 md:space-y-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 md:h-4 md:w-4 ${
                        i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground">(0 avis)</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">{formatCurrency(product.price)}</p>
            </div>

            <Separator />

            <div>
              <h2 className="text-sm md:text-base font-semibold mb-2">Description</h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Stock et quantité */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base font-medium">Disponibilité :</span>
                {product.stock > 0 ? (
                  <Badge variant="default" className="bg-green-600 text-xs md:text-sm">
                    En stock ({product.stock} disponible{product.stock > 1 ? "s" : ""})
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs md:text-sm">Rupture de stock</Badge>
                )}
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-sm md:text-base font-medium">Quantité :</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 md:h-10 md:w-10 rounded-r-none"
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <span className="text-base md:text-lg">-</span>
                    </Button>
                    <span className="px-3 md:px-4 py-2 min-w-[2.5rem] md:min-w-[3rem] text-center text-sm md:text-base font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 md:h-10 md:w-10 rounded-l-none"
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <span className="text-base md:text-lg">+</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !product.isActive}
                className="flex-1 text-sm md:text-base"
                size="default"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleLike}
                  className="flex-1 sm:flex-none"
                >
                  <Heart className={`h-4 w-4 md:h-5 md:w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="flex-1 sm:flex-none">
                      <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer">
                      <Twitter className="mr-2 h-4 w-4" />
                      Twitter / X
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer">
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copié!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copier le lien
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-3 md:pt-4 border-t">
              <div className="flex items-start gap-2 md:gap-3">
                <Truck className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-xs md:text-sm">Livraison gratuite</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Sur toutes les commandes</p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-xs md:text-sm">Paiement sécurisé</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">100% sécurisé</p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <RotateCcw className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-xs md:text-sm">Retour facile</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Sous 30 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Produits similaires</h2>
            <ProductGrid products={similarProducts} showActions={true} />
          </div>
        )}

        {/* Produits récemment vus */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Récemment consultés</h2>
            <ProductGrid products={recentlyViewed} showActions={true} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

