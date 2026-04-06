import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const branchName = searchParams.get("branch") || ""

    // Resolve branch name → id
    let branchId: string | undefined
    if (branchName && branchName !== "Все филиалы") {
      const branch = await prisma.branch.findFirst({ where: { name: branchName } })
      branchId = branch?.id
    }

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (role) where.role = role
    if (branchId) where.branchId = branchId

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          branch: true,
          kpiRecords: {
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role, phone, branchId } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Имя, email и пароль обязательны" }, { status: 400 })
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 })
    }

    // Hash password using bcrypt (already in deps)
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "AGENT",
        phone: phone || null,
        branchId: branchId || null,
      },
      include: { branch: true },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user
    return NextResponse.json(safeUser, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
