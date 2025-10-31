"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ProductsManagement } from "./products-management"
import { OrdersManagement } from "./orders-management"
import { MerchantsManagement } from "./merchants-management"

export function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("products")

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Administration</h1>
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="merchants">Commerçants</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="merchants" className="mt-6">
            <MerchantsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
