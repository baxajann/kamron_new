import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("category") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = categoryId

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, inventory: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ])

    // Compute stock value from Inventory relation (stockQty does not exist on Product)
    const totalStockValue = products.reduce((sum, p) => {
      const qty = p.inventory.reduce((s, inv) => s + inv.quantity, 0)
      return sum + p.price * qty
    }, 0)

    const lowStockCount = await prisma.inventory.count({ where: { quantity: { lte: 20 } } })
    const categoriesCount = await prisma.category.count()

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      summary: { totalStockValue, lowStockCount, categoriesCount, totalProducts: total },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
