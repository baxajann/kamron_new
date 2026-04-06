import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const types = await prisma.clientType.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ types })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
