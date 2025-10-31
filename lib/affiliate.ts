import { prisma } from "./prisma"

export async function getMerchantByAffiliateCode(affiliateCode: string) {
  return prisma.merchant.findUnique({
    where: { affiliateCode },
    include: { user: true },
  })
}

export async function trackAffiliateClick(affiliateCode: string) {
  // Stocker le code d'affiliation dans les cookies pour le tracking
  return affiliateCode
}

export async function calculateCommission(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      merchant: true,
      items: true,
    },
  })

  if (!order || !order.merchant) {
    return null
  }

  const commissionAmount = (order.totalAmount * order.merchant.commissionRate) / 100

  // Créer la commission
  const commission = await prisma.commission.create({
    data: {
      orderId: order.id,
      merchantId: order.merchant.id,
      amount: commissionAmount,
      commissionRate: order.merchant.commissionRate,
    },
  })

  // Mettre à jour les gains du commerçant
  await prisma.merchant.update({
    where: { id: order.merchant.id },
    data: {
      pendingEarnings: {
        increment: commissionAmount,
      },
    },
  })

  return commission
}

export async function markCommissionAsPaid(commissionId: string) {
  const commission = await prisma.commission.findUnique({
    where: { id: commissionId },
    include: { merchant: true },
  })

  if (!commission) {
    throw new Error("Commission non trouvée")
  }

  // Mettre à jour la commission
  await prisma.commission.update({
    where: { id: commissionId },
    data: {
      isPaid: true,
      paidAt: new Date(),
    },
  })

  // Mettre à jour les gains du commerçant
  await prisma.merchant.update({
    where: { id: commission.merchantId },
    data: {
      totalEarnings: {
        increment: commission.amount,
      },
      pendingEarnings: {
        decrement: commission.amount,
      },
    },
  })
}
