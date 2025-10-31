"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT">("CUSTOMER")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data: any = await response.json().catch(() => ({}))
      console.log("[register-form] status:", response.status, "payload:", data)

      if (!response.ok) {
        setError(data.error || `Erreur d'inscription (code ${response.status})`)
        return
      }

      if (!data?.user) {
        setError("Réponse invalide du serveur")
        return
      }

      // Rediriger vers login après inscription réussie
      router.push("/login")
      router.refresh()
    } catch (err: any) {
      console.error("[register-form] exception:", err)
      setError("Erreur d'inscription (réseau)")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>Créez votre compte</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Type de compte</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "CUSTOMER" | "MERCHANT")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CUSTOMER" id="customer" />
                <Label htmlFor="customer" className="font-normal">
                  Client
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MERCHANT" id="merchant" />
                <Label htmlFor="merchant" className="font-normal">
                  Commerçant (Affilié)
                </Label>
              </div>
            </RadioGroup>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
