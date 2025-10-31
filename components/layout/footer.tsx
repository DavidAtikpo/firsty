"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, HelpCircle, Info, Users, Phone, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-12 sm:mt-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* À propos */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              À propos
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Notre histoire
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-foreground transition-colors">
                  Notre équipe
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground transition-colors">
                  Carrières
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contactez-nous
                </Link>
              </li>
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Aide
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-foreground transition-colors">
                  Livraison
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-foreground transition-colors">
                  Retours
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Réseaux sociaux
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Suivez-nous pour rester informé de nos dernières nouveautés
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </Link>
              <Link
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              Newsletter
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Recevez nos offres exclusives et nouveautés directement dans votre boîte mail
            </p>
            <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); }}>
              <Input
                type="email"
                placeholder="Votre email"
                className="w-full"
                required
              />
              <Button type="submit" className="w-full" size="sm">
                S'abonner
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t pt-6 sm:pt-8 mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © {new Date().getFullYear()} Firsty Shop. Tous droits réservés.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Support: +33 1 23 45 67 89</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

