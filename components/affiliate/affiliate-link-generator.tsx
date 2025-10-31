"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"

interface AffiliateLinkGeneratorProps {
  affiliateCode: string
}

export function AffiliateLinkGenerator({ affiliateCode }: AffiliateLinkGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const affiliateLink = `${baseUrl}/shop?ref=${affiliateCode}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre lien d'affiliation</CardTitle>
        <CardDescription>Partagez ce lien pour gagner des commissions sur les ventes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="affiliate-code">Code d'affiliation</Label>
          <Input id="affiliate-code" value={affiliateCode} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="affiliate-link">Lien complet</Label>
          <div className="flex gap-2">
            <Input id="affiliate-link" value={affiliateLink} readOnly className="flex-1" />
            <Button onClick={copyToClipboard} size="icon" variant="outline">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Lorsqu'un client clique sur votre lien et effectue un achat dans les 30 jours, vous gagnez une commission.
        </p>
      </CardContent>
    </Card>
  )
}
