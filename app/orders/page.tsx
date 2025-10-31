import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { OrdersList } from "@/components/orders/orders-list"

export default async function OrdersPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <OrdersList />
}
