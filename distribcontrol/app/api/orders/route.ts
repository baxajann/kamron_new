import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const agentId = searchParams.get("agentId") || ""
    const branchName = searchParams.get("branch") || ""
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
        { orderNumber: { contains: search } },
        { client: { name: { contains: search } } },
      ]
    }
    if (status) where.status = status
    if (agentId) where.agentId = agentId
    if (branchId) where.branchId = branchId

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { client: true, agent: true, branch: true, items: { include: { product: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, ...orderData } = body
    
    // Robustly generate the next order number
    const lastOrder = await prisma.order.findFirst({ 
      where: { orderNumber: { startsWith: "ORD-" } },
      orderBy: { createdAt: "desc" } 
    })
    
    let num = 10001
    if (lastOrder && lastOrder.orderNumber) {
      const match = lastOrder.orderNumber.match(/\d+/)
      if (match) {
        num = parseInt(match[0]) + 1
      }
    }
    
    let generatedOrderNumber = `ORD-${String(num).padStart(5, "0")}`
    
    // Safety check to prevent any accidental unique constraint violations
    let exists = await prisma.order.findUnique({ where: { orderNumber: generatedOrderNumber } })
    let suffix = 0
    while (exists) {
      suffix++
      generatedOrderNumber = `ORD-${String(num).padStart(5, "0")}-${suffix}`
      exists = await prisma.order.findUnique({ where: { orderNumber: generatedOrderNumber } })
    }

    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderNumber: generatedOrderNumber,
        items: { create: items },
      },
      include: { client: true, items: { include: { product: true } } },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (e: any) {
    console.error("ORDER CREATE ERROR", e)
    return NextResponse.json({ error: e.message || String(e) || "Server error" }, { status: 500 })
  }
}
