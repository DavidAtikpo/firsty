import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { createSession } from "@/lib/session"
import type { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body
    console.log("[register] incoming payload", { email, hasPassword: !!password, name, role })

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const validRoles: UserRole[] = ["CUSTOMER", "MERCHANT"]
    const userRole = validRoles.includes(role) ? role : "CUSTOMER"
    console.log("[register] resolved role", { userRole })

    const user = await createUser(email, password, name, userRole)
    console.log("[register] user created", { id: user.id, email: user.email, role: user.role })

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    // Ne pas créer de session automatiquement - l'utilisateur devra se connecter
    console.log("[register] user registered, session will be created on login")

    return NextResponse.json({ success: true, user: authUser })
  } catch (error: any) {
    console.error("[register] error", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    })
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
