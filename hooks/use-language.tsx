"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "fr" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<string, Record<Language, string>> = {
  products: { fr: "Produits", en: "Products" },
  categories: { fr: "Catégories", en: "Categories" },
  search: { fr: "Rechercher", en: "Search" },
  cartShort: { fr: "Panier", en: "Cart" },
  inStockShort: { fr: "En stock", en: "In Stock" },
  outOfStockShort: { fr: "Rupture", en: "Out" },
  allProducts: { fr: "Tous les produits", en: "All Products" },
  loadingProducts: { fr: "Chargement...", en: "Loading..." },
  noProductsFound: { fr: "Aucun produit trouvé", en: "No products found" },
  retry: { fr: "Réessayer", en: "Retry" },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr")

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "fr" || savedLang === "en")) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return defaults if not in provider
    return {
      language: "fr" as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    }
  }
  return context
}


