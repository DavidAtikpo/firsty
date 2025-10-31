import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération de la session" }, { status: 500 })
  }
}
