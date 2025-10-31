import { type NextRequest, NextResponse } from "next/server"
import { getMerchantByAffiliateCode } from "@/lib/affiliate"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Code d'affiliation requis" }, { status: 400 })
    }

    const merchant = await getMerchantByAffiliateCode(code)

    if (!merchant) {
      return NextResponse.json({ error: "Code d'affiliation invalide" }, { status: 404 })
    }

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
    return NextResponse.json({ error: "Erreur lors du tracking" }, { status: 500 })
  }
}
