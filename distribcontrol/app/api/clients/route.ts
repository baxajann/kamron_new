import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const branchName = searchParams.get("branch") || ""
    const category = searchParams.get("category") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20

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
        { phone: { contains: search } },
        { email: { contains: search } },
        { contactPerson: { contains: search } },
      ]
    }
    if (status) where.status = status
    if (branchId) where.branchId = branchId
    if (category) where.category = category

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: { branch: true, clientType: true, territory: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({ clients, total, pages: Math.ceil(total / limit) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, contactPerson, region, category, status, debtLimit, branchId, clientTypeId, address, comment } = body

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone: phone || null,
        contactPerson: contactPerson || null,
        region: region || null,
        category: category || null,
        status: status || "ACTIVE",
        debtLimit: debtLimit ? parseFloat(debtLimit) : 0,
        branchId: branchId || null,
        clientTypeId: clientTypeId || null,
        address: address || null,
        comment: comment || null,
      },
      include: { branch: true, clientType: true },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
