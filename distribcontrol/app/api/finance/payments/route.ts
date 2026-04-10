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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, method, note, type, category } = body

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const transaction = await prisma.payment.create({
      data: {
        amount: Number(amount),
        method: method || "CASH",
        note,
        type: type || "INCOME",
        category,
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, amount, method, note, type, category } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(method !== undefined && { method }),
        ...(note !== undefined && { note }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
      }
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
