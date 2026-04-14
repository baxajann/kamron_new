import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json()

    // Assuming Client model has status field
    const client = await prisma.client.update({
      where: { id: resolvedParams.id },
      data: { status }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client status:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
