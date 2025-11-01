import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { calculateCommission, getMerchantByAffiliateCode } from "@/lib/affiliate"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    let orders

    if (session.role === "ADMIN") {
      orders = await prisma.order.findMany({
        include: {
          customer: true,
          merchant: { include: { user: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (session.role === "MERCHANT") {
      orders = await prisma.order.findMany({
        where: { merchantId: session.merchantId },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      orders = await prisma.order.findMany({
        where: { customerId: session.id },
        include: {
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des commandes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { items, shippingAddress, customerName, customerEmail } = body

    if (!items || items.length === 0 || !shippingAddress || !customerName || !customerEmail) {
      return NextResponse.json({ error: "Données de commande invalides" }, { status: 400 })
    }

    // Vérifier le stock et calculer le total
    let totalAmount = 0
    const productIds = items.map((item: any) => item.productId)

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour ${product?.name || "un produit"}` }, { status: 400 })
      }
      totalAmount += product.price * item.quantity
    }

    // Récupérer le code d'affiliation depuis les cookies
    const cookieStore = await cookies()
    const affiliateCookie = cookieStore.get("affiliate_code")
    let merchantId: string | null = null

    if (affiliateCookie) {
      const merchant = await getMerchantByAffiliateCode(affiliateCookie.value)
      if (merchant) {
        merchantId = merchant.id
      }
    }

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.id,
        merchantId,
        totalAmount,
        customerName,
        customerEmail,
        shippingAddress,
        items: {
          create: items.map((item: any) => {
            const product = products.find((p) => p.id === item.productId)!
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            }
          }),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    })

    // Mettre à jour le stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Calculer la commission si un commerçant est associé
    if (merchantId) {
      await calculateCommission(order.id)
      
      // Marquer le dernier clic comme converti (généré une commande)
      // On prend le clic le plus récent de ce commerçant (dans les 30 derniers jours)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      // Trouver le clic le plus récent non converti
      const latestClick = await prisma.affiliateClick.findFirst({
        where: {
          merchantId,
          converted: false,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      
      // Mettre à jour ce clic si trouvé
      if (latestClick) {
        await prisma.affiliateClick.update({
          where: { id: latestClick.id },
          data: {
            converted: true,
          },
        })
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la commande" }, { status: 500 })
  }
}
