import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { markCommissionAsPaid } from "@/lib/affiliate"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ success: false })
    }

    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { isPaid } = body

    if (isPaid === true) {
      await markCommissionAsPaid(id)
    } else {
      // Marquer comme non payé (annuler le paiement)
      const commission = await prisma.commission.findUnique({
        where: { id },
        include: { merchant: true },
      })

      if (!commission) {
        return NextResponse.json({ error: "Commission non trouvée" }, { status: 404 })
      }

      await prisma.commission.update({
        where: { id },
        data: {
          isPaid: false,
          paidAt: null,
        },
      })

      // Revenir en arrière sur les gains du commerçant
      await prisma.merchant.update({
        where: { id: commission.merchantId },
        data: {
          totalEarnings: {
            decrement: commission.amount,
          },
          pendingEarnings: {
            increment: commission.amount,
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /api/admin/commissions/[id]:", error)
    
    // During build, return empty response instead of error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ success: false })
    }

    return NextResponse.json({ error: "Erreur lors de la mise à jour de la commission" }, { status: 500 })
  }
}

