import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json()

    // Personnel is User model
    const user = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { status }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating personnel status:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
