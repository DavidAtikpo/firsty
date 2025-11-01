import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // During build time, return empty response to avoid build errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ error: "Export non disponible" }, { status: 400 })
    }

    const session = await getSession()

    if (!session || session.role !== "MERCHANT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "stats"

    const merchant = await prisma.merchant.findUnique({
      where: session.merchantId ? { id: session.merchantId } : { userId: session.id },
      include: {
        referrals: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        commissions: {
          include: {
            order: {
              select: {
                orderNumber: true,
                totalAmount: true,
                customerName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        clicks: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!merchant) {
      return NextResponse.json({ error: "Commerçant non trouvé" }, { status: 404 })
    }

    let csvContent = ""
    let filename = ""

    if (type === "orders") {
      // Export des commandes
      filename = `commandes_${new Date().toISOString().split("T")[0]}.csv`
      const headers = [
        "Date",
        "Numéro de commande",
        "Client",
        "Email",
        "Montant total",
        "Statut",
        "Articles",
      ]
      const rows = merchant.referrals.map((order) => [
        new Date(order.createdAt).toLocaleDateString("fr-FR"),
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.totalAmount.toFixed(2),
        order.status,
        order.items.map((item) => `${item.product.name} x${item.quantity}`).join("; "),
      ])

      csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
    } else if (type === "commissions") {
      // Export des commissions
      filename = `commissions_${new Date().toISOString().split("T")[0]}.csv`
      const headers = ["Date", "Numéro de commande", "Client", "Montant commande", "Taux", "Commission", "Payé", "Date paiement"]
      const rows = merchant.commissions.map((commission) => [
        new Date(commission.createdAt).toLocaleDateString("fr-FR"),
        commission.order.orderNumber,
        commission.order.customerName,
        commission.order.totalAmount.toFixed(2),
        `${commission.commissionRate}%`,
        commission.amount.toFixed(2),
        commission.isPaid ? "Oui" : "Non",
        commission.paidAt ? new Date(commission.paidAt).toLocaleDateString("fr-FR") : "",
      ])

      csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
    } else if (type === "clicks") {
      // Export des clics
      filename = `clics_${new Date().toISOString().split("T")[0]}.csv`
      const headers = ["Date", "IP", "Converti", "User Agent", "Referer"]
      const rows = merchant.clicks.map((click) => [
        new Date(click.createdAt).toLocaleDateString("fr-FR"),
        click.ipAddress || "",
        click.converted ? "Oui" : "Non",
        click.userAgent || "",
        click.referer || "",
      ])

      csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
    } else {
      // Export des statistiques générales
      filename = `statistiques_${new Date().toISOString().split("T")[0]}.csv`
      const totalRevenue = merchant.referrals.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalClicks = merchant.clicks.length
      const convertedClicks = merchant.clicks.filter((c) => c.converted).length
      const conversionRate = totalClicks > 0 ? ((convertedClicks / totalClicks) * 100).toFixed(2) : "0"

      csvContent = [
        "Statistique,Valeur",
        `Code d'affiliation,"${merchant.affiliateCode}"`,
        `Taux de commission,${merchant.commissionRate}%`,
        `Gains totaux,${merchant.totalEarnings.toFixed(2)}`,
        `Gains en attente,${merchant.pendingEarnings.toFixed(2)}`,
        `Commandes référées,${merchant.referrals.length}`,
        `Revenu total,${totalRevenue.toFixed(2)}`,
        `Total clics,${totalClicks}`,
        `Clics convertis,${convertedClicks}`,
        `Taux de conversion,${conversionRate}%`,
      ].join("\n")
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/merchants/export:", error)
    
    // During build, return error
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ error: "Export non disponible" }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
}

