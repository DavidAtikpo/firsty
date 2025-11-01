import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        <Suspense fallback={<div className="h-96" />}>
          <LoginFormWrapper />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
