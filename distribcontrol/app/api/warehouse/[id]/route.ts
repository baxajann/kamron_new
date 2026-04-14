import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json()
    const { status } = body

    const product = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: { status }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product status:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
