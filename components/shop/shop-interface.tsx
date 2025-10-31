"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/layout/footer"

export function ShopInterface() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Tracker le code d'affiliation si présent
    const refCode = searchParams.get("ref")
    if (refCode) {
      fetch(`/api/affiliate/track?code=${refCode}`).catch((error) => {
        console.error("Error tracking affiliate:", error)
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ProductGrid />
      <Footer />
    </div>
  )
}
