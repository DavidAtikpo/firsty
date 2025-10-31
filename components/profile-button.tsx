"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ProfileButton() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setIsAuthenticated(!!data?.user)
        setUser(data?.user)
      } else {
        setIsAuthenticated(false)
      }
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setIsAuthenticated(false)
      router.push("/shop")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <span className="hidden sm:inline">Connexion</span>
            <span className="sm:hidden">Connex</span>
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
            <span className="hidden sm:inline">Inscription</span>
            <span className="sm:hidden">Inscrit</span>
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        {user?.role === "ADMIN" && (
          <Link href="/admin">
            <DropdownMenuItem>Administration</DropdownMenuItem>
          </Link>
        )}
        {user?.role === "MERCHANT" && (
          <Link href="/merchant">
            <DropdownMenuItem>Tableau de bord</DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

