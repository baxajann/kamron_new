import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 30

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { client: { name: { contains: search } } },
        { order: { orderNumber: { contains: search } } },
      ]
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { client: true, order: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paidAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({ payments, total, pages: Math.ceil(total / limit) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
