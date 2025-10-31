import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  let session = null
  
  try {
    session = await getSession()
  } catch (error) {
    // Silently fail - show the page anyway
    console.warn("Could not get session:", error)
  }

  // Redirect according to state
  if (session) {
    if (session.role === "ADMIN") {
      redirect("/admin")
    } else if (session.role === "MERCHANT") {
      redirect("/merchant")
    } else {
      redirect("/shop")
    }
  } else {
    // Guests land directly on the shop
    redirect("/shop")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Plateforme E-commerce avec Affiliation</CardTitle>
          <CardDescription className="text-base">
            Rejoignez notre marketplace et gagnez des commissions en référant des clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pour les clients</CardTitle>
                <CardDescription>Découvrez nos produits</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/register">
                  <Button className="w-full">Créer un compte client</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pour les commerçants</CardTitle>
                <CardDescription>Gagnez des commissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/register">
                  <Button className="w-full bg-transparent" variant="outline">
                    Devenir commerçant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">Déjà inscrit ?</p>
            <Link href="/login">
              <Button variant="secondary">Se connecter</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
