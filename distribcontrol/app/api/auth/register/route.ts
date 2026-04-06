import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, phone } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "AGENT", phone },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
