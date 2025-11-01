import { type NextRequest, NextResponse } from "next/server"
import { getMerchantByAffiliateCode } from "@/lib/affiliate"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ success: false })
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Code d'affiliation requis" }, { status: 400 })
    }

    const merchant = await getMerchantByAffiliateCode(code)

    if (!merchant) {
      return NextResponse.json({ error: "Code d'affiliation invalide" }, { status: 404 })
    }

    // Enregistrer le clic
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      request.ip || 
                      "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const referer = request.headers.get("referer") || request.headers.get("referrer") || null

    await prisma.affiliateClick.create({
      data: {
        merchantId: merchant.id,
        ipAddress,
        userAgent,
        referer,
        converted: false, // Sera mis à true si une commande est créée
      },
    })

    // Créer une réponse avec le cookie d'affiliation
    const response = NextResponse.json({ success: true, merchant: { name: merchant.user.name } })

    response.cookies.set("affiliate_code", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in GET /api/affiliate/track:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ success: false })
    }

    return NextResponse.json({ error: "Erreur lors du tracking" }, { status: 500 })
  }
}
