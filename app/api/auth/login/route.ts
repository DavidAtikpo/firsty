import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("[v0] Login attempt for email:", email)

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    console.log("[v0] Attempting to authenticate user...")
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log("[v0] Authentication failed - user not found or invalid password")
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    console.log("[v0] User authenticated successfully:", user.email, "Role:", user.role)
    await createSession(user)
    console.log("[v0] Session created successfully")

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 })
  }
}
