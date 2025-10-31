"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, Facebook, Twitter, MessageCircle, Copy, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    image: string | null
    stock: number
    isActive: boolean
  }
  onAddToCart?: (productId: string) => void
  showActions?: boolean
}

export function ProductCard({ product, onAddToCart, showActions = true }: ProductCardProps) {
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/shop?product=${product.id}` : ""
  const productText = `Découvrez ${product.name} sur Firsty Shop!`

  const handleShare = (platform: string) => {
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
    // TODO: Sauvegarder le like dans la base de données
    toast({
      title: liked ? "Retiré des favoris" : "Ajouté aux favoris",
      description: liked ? "Le produit a été retiré de vos favoris." : "Le produit a été ajouté à vos favoris.",
    })
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full p-0 gap-0">
      <div className="relative aspect-[3/4] sm:aspect-square bg-muted group m-0">
        {product.image ? (
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">Pas d'image</span>
          </div>
        )}
        {!product.isActive && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            Inactif
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge className="absolute top-2 left-2" variant="destructive">
            Rupture de stock
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background"
            onClick={handleLike}
            aria-label="Ajouter aux favoris"
          >
            <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background"
                aria-label="Partager"
              >
                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
      <CardContent className="flex-1 p-1.5 sm:p-4 pt-1 sm:pt-4">
        <h3 className="font-semibold text-sm sm:text-lg mb-0 sm:mb-2 line-clamp-1">{product.name}</h3>
        <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">{product.description}</p>
        <div className="flex items-center justify-between gap-1 mt-0.5 sm:mt-0">
          <span className="text-base sm:text-2xl font-bold">{formatPrice(product.price)}</span>
          <span className="hidden sm:inline text-xs sm:text-sm text-muted-foreground">Stock: {product.stock}</span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-1.5 sm:p-4 pt-1 sm:pt-0">
          <Button
            className="w-full text-xs sm:text-base h-8 sm:h-10"
            onClick={() => onAddToCart?.(product.id)}
            disabled={product.stock === 0 || !product.isActive}
            size="sm"
          >
            <span className="hidden sm:inline">{product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}</span>
            <span className="sm:hidden">{product.stock === 0 ? "Rupture" : "Ajouter"}</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
