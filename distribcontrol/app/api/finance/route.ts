import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get("days") || "30")

    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const [payments, debts, orders] = await Promise.all([
      prisma.payment.findMany({
        where: { paidAt: { gte: startDate } },
        include: { client: true, order: { include: { debt: true } } },
        orderBy: { paidAt: "desc" },
        take: 50,
      }),
      prisma.debt.findMany({ where: { status: "ACTIVE" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startDate } } }),
    ])

    const totalPayments = payments.reduce((sum: number, p: any) => sum + p.amount, 0)

    return NextResponse.json({
      payments,
      summary: {
        todayIncome: payments.filter((p: any) => p.paidAt >= startDate).reduce((sum: number, p: any) => sum + p.amount, 0),
        monthIncome: totalPayments,
        expectedDebts: debts.reduce((sum: number, d: any) => sum + d.amount, 0),
        overdueDebts: debts.filter((d: any) => d.daysOverdue > 0).reduce((sum: number, d: any) => sum + d.amount, 0) || 0,
        totalSales: orders._sum.totalAmount || 0,
        cashOnHand: totalPayments * 0.85,
        bankTransfers: totalPayments * 0.15,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
