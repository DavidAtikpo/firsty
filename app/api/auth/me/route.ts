import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ user: null })
    }

    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error in GET /api/auth/me:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ error: "Erreur lors de la récupération de la session" }, { status: 500 })
  }
}
