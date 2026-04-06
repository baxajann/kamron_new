import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { agent: { name: { contains: search } } },
      ]
    }

    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        include: {
          agent: { include: { branch: true } },
          branch: true,
          territory: true,
          _count: { select: { visits: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.route.count({ where }),
    ])

    return NextResponse.json({ routes, total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
