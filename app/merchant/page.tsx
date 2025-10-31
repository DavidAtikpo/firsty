import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { MerchantDashboard } from "@/components/merchant/merchant-dashboard"

export default async function MerchantPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.role !== "MERCHANT") {
    redirect("/")
  }

  return <MerchantDashboard />
}
