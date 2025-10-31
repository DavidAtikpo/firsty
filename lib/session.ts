import { cookies } from "next/headers"
import type { AuthUser } from "./auth"

const SESSION_COOKIE_NAME = "session"

export async function createSession(user: AuthUser) {
  const sessionData = JSON.stringify(user)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: "/",
  })
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as AuthUser
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
