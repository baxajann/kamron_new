import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const branchName = searchParams.get("branch") || ""
    const search = searchParams.get("search") || ""

    // Resolve branch name → id
    let branchId: string | undefined
    if (branchName && branchName !== "Все филиалы") {
      const branch = await prisma.branch.findFirst({ where: { name: branchName } })
      branchId = branch?.id
    }

    const where: Record<string, unknown> = { role: "AGENT" }
    if (branchId) where.branchId = branchId
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const agents = await prisma.user.findMany({
      where,
      include: {
        branch: true,
        kpiRecords: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    })

    const result = agents.map(agent => {
      const kpi = agent.kpiRecords[0] || null
      const kpiPercent = kpi && kpi.planSales > 0
        ? Math.round((kpi.actualSales / kpi.planSales) * 100)
        : 0
      return { ...agent, kpi, kpiPercent }
    })

    return NextResponse.json({ agents: result })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
