import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const branchName = searchParams.get("branch") || ""
    const period = searchParams.get("period") || "Сегодня"

    // Resolve branch name to id
    let branchId: string | undefined
    if (branchName && branchName !== "Все филиалы") {
      const branch = await prisma.branch.findFirst({ where: { name: branchName } })
      branchId = branch?.id
    }

    const branchFilter = branchId ? { branchId } : {}
    const clientBranchFilter = branchId ? { client: { branchId } } : {}
    const agentBranchFilter = branchId ? { agent: { branchId } } : {}
    const paymentBranchFilter = branchId ? { client: { branchId } } : {}

    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    if (period === "Сегодня") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      endDate = new Date(startDate.getTime() + 86400000)
    } else if (period === "Вчера") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      endDate = new Date(startDate.getTime() + 86400000)
    } else if (period === "7 дней") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    } else if (period === "Месяц") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }

    const dateFilter = { gte: startDate, lt: endDate }
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalOrders,
      periodOrders,
      monthOrders,
      totalClients,
      activeClients,
      totalDebts,
      periodVisits,
      totalVisits,
      deliveredOrders,
      shippedOrders,
      pendingOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { ...branchFilter } }),
      prisma.order.count({ where: { ...branchFilter, createdAt: dateFilter } }),
      prisma.order.count({ where: { ...branchFilter, createdAt: { gte: startOfMonth } } }),
      prisma.client.count({ where: { ...branchFilter } }),
      prisma.client.count({ where: { ...branchFilter, status: "ACTIVE" } }),
      prisma.debt.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE", ...clientBranchFilter } }),
      prisma.visit.count({ where: { ...agentBranchFilter, visitDate: dateFilter } }),
      prisma.visit.count({ where: { ...agentBranchFilter, visitDate: { gte: startOfMonth } } }),
      prisma.order.count({ where: { ...branchFilter, status: "DELIVERED" } }),
      prisma.order.count({ where: { ...branchFilter, status: "SHIPPED" } }),
      prisma.order.count({ where: { ...branchFilter, status: "NEW" } }),
    ])

    const periodSales = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { ...branchFilter, createdAt: dateFilter, status: { not: "CANCELLED" } },
    })

    const monthSales = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { ...branchFilter, createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
    })

    const periodPayments = await prisma.payment.aggregate({
       _sum: { amount: true },
       where: { ...paymentBranchFilter, paidAt: dateFilter },
    })

    const periodReturns = await prisma.return.count({
      where: { order: branchFilter, createdAt: dateFilter },
    })

    const visitedCount = await prisma.visit.count({ where: { ...agentBranchFilter, status: "VISITED", visitDate: dateFilter } })
    const missedCount = await prisma.visit.count({ where: { ...agentBranchFilter, status: "MISSED", visitDate: dateFilter } })

    const daysCount = Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
    let intervals: { start: Date, end: Date, label: string }[] = []

    if (daysCount <= 1) {
      // 1-day period => 6 intervals of 4 hours each
      for (let i = 0; i < 6; i++) {
        const start = new Date(startDate.getTime() + i * 4 * 3600000)
        const end = new Date(start.getTime() + 4 * 3600000)
        intervals.push({ start, end, label: `${String(start.getHours()).padStart(2, '0')}:00` })
      }
    } else {
      // multi-day period => 1 interval per day
      for (let i = 0; i < daysCount; i++) {
        const start = new Date(startDate.getTime() + i * 86400000)
        const end = new Date(start.getTime() + 86400000)
        intervals.push({ start, end, label: start.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) })
      }
    }

    const salesTrend = await Promise.all(intervals.map(async (interval) => {
      const dayOrders = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { ...branchFilter, createdAt: { gte: interval.start, lt: interval.end }, status: { not: "CANCELLED" } },
      })
      const dayPayments = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { ...paymentBranchFilter, paidAt: { gte: interval.start, lt: interval.end } },
      })
      return {
        date: interval.label,
        sales: dayOrders._sum.totalAmount || 0,
        payments: dayPayments._sum.amount || 0,
      }
    }))

    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: { ...branchFilter, createdAt: dateFilter }
    })

    const topAgents = await prisma.user.findMany({
      where: { role: "AGENT", ...branchFilter },
      include: {
        orders: { 
          where: { createdAt: dateFilter },
          select: { totalAmount: true, status: true } 
        },
        visits: { 
          where: { visitDate: dateFilter },
          select: { status: true } 
        },
        kpiRecords: { select: { actualSales: true, planSales: true, month: true }, orderBy: { month: "desc" }, take: 1 },
      },
      take: 7,
    })

    const agentsData = topAgents.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      orders: agent.orders.length,
      sales: agent.orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0),
      visits: agent.visits.length,
      visited: agent.visits.filter((v: any) => v.status === "VISITED").length,
      missed: agent.visits.filter((v: any) => v.status === "MISSED").length,
      kpi: agent.kpiRecords[0] ? Math.round((agent.kpiRecords[0].actualSales / agent.kpiRecords[0].planSales) * 100) : 0,
    }))

    return NextResponse.json({
      kpi: {
        todaySales: periodSales._sum.totalAmount || 0,
        monthSales: monthSales._sum.totalAmount || 0,
        todayPayments: periodPayments._sum.amount || 0,
        todayReturns: periodReturns,
        todayOrders: periodOrders,
        monthOrders,
        totalClients,
        activeClients,
        totalDebt: totalDebts._sum.amount || 0,
        todayVisits: periodVisits,
        monthVisits: totalVisits,
      },
      visits: {
        visited: visitedCount,
        missed: missedCount,
        total: visitedCount + missedCount,
        successRate: visitedCount + missedCount > 0 ? Math.round((visitedCount / (visitedCount + missedCount)) * 100) : 0,
      },
      orders: {
        delivered: deliveredOrders,
        shipped: shippedOrders,
        pending: pendingOrders,
        total: totalOrders,
        deliveredRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
      },
      salesTrend,
      ordersByStatus: ordersByStatus.map((s: any) => ({ status: s.status, count: s._count })),
      agents: agentsData,
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
