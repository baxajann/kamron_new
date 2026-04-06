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
        { region: { contains: search } },
      ]
    }

    const [territories, total] = await Promise.all([
      prisma.territory.findMany({
        where,
        include: {
          _count: { select: { clients: true, routes: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.territory.count({ where }),
    ])

    return NextResponse.json({ territories, total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
