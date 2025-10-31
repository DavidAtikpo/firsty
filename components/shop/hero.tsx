"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, TrendingUp } from "lucide-react"

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Users className="h-4 w-4" />
            <span>Système d'affiliation</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Gagnez des <span className="text-primary">commissions</span> en recommandant nos produits
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Rejoignez notre programme d'affiliation et gagnez de l'argent en partageant nos produits. 
            Pour chaque vente générée par votre lien, recevez une commission attractive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Devenir affilié
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#products">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Découvrir les produits
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

