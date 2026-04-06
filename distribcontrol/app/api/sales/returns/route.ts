import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { order: { orderNumber: { contains: search } } },
        { order: { client: { name: { contains: search } } } },
      ]
    }

    const [returns, total] = await Promise.all([
      prisma.return.findMany({
        where,
        include: {
          order: {
            include: { client: true, agent: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.return.count({ where }),
    ])

    return NextResponse.json({ returns, total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
