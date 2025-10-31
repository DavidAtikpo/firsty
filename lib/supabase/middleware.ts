import { NextResponse, type NextRequest } from "next/server"
import type { AuthUser } from "../auth"

const SESSION_COOKIE_NAME = "session"

function getSessionFromRequest(request: NextRequest): AuthUser | null {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as AuthUser
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  try {
    const user = getSessionFromRequest(request)

    // Always allow API routes to pass through without auth redirects
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.next({ request })
    }

    // Allow public routes and the home page
    const publicPaths = ["/", "/login", "/register", "/auth", "/shop"]
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/")
    )

    // If user is not logged in and trying to access protected route, redirect to login
    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    return NextResponse.next({
      request,
    })
  } catch (error) {
    // If middleware fails, allow the request to continue
    console.error("Middleware error:", error)
    return NextResponse.next({
      request,
    })
  }
}
