import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la commande" }, { status: 500 })
  }
}
