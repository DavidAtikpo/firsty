import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  merchantId?: string
  affiliateCode?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name: string, role: UserRole = "CUSTOMER") {
  console.log("[v0] Creating user:", email, "with role:", role)
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  })

  console.log("[v0] User created successfully:", user.id)

  // Si c'est un commerçant, créer son profil avec code d'affiliation
  if (role === "MERCHANT") {
    const affiliateCode = generateAffiliateCode()
    console.log("[v0] Creating merchant profile with code:", affiliateCode)
    await prisma.merchant.create({
      data: {
        userId: user.id,
        affiliateCode,
      },
    })
  }

  return user
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  console.log("[v0] Looking up user:", email)

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      merchantProfile: true,
    },
  })

  if (!user) {
    console.log("[v0] User not found in database")
    return null
  }

  console.log("[v0] User found, verifying password...")
  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    console.log("[v0] Password verification failed")
    return null
  }

  console.log("[v0] Password verified successfully")
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    merchantId: user.merchantProfile?.id,
    affiliateCode: user.merchantProfile?.affiliateCode,
  }
}

function generateAffiliateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
