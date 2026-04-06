import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20

    const where: Record<string, unknown> = { status: "ACTIVE" }
    if (search) {
      where.OR = [
        { client: { name: { contains: search } } },
        { order: { orderNumber: { contains: search } } },
      ]
    }

    const [debts, total, summary] = await Promise.all([
      prisma.debt.findMany({
        where,
        include: { client: true, order: { include: { agent: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { daysOverdue: "desc" },
      }),
      prisma.debt.count({ where }),
      prisma.debt.aggregate({ _sum: { amount: true, amountUsd: true, amountEur: true }, where: { status: "ACTIVE" } }),
    ])

    // Aging buckets
    const bucket1 = await prisma.debt.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE", daysOverdue: { lte: 7 } } })
    const bucket2 = await prisma.debt.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE", daysOverdue: { gt: 7, lte: 30 } } })
    const bucket3 = await prisma.debt.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE", daysOverdue: { gt: 30, lte: 120 } } })
    const bucket4 = await prisma.debt.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE", daysOverdue: { gt: 120 } } })

    return NextResponse.json({
      debts,
      total,
      pages: Math.ceil(total / limit),
      summary: { total: summary._sum.amount || 0, totalUsd: summary._sum.amountUsd || 0, totalEur: summary._sum.amountEur || 0 },
      buckets: {
        b1: bucket1._sum.amount || 0,
        b2: bucket2._sum.amount || 0,
        b3: bucket3._sum.amount || 0,
        b4: bucket4._sum.amount || 0,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
