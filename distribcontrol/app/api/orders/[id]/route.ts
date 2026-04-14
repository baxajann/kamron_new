import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single order
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        agent: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// PATCH - update status only
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { status } = await req.json();

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// PUT - update full order (edit)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await req.json();
    const { clientId, paymentType, note, status, paymentStatus, items } = body;

    // Calculate totalAmount from items
    const totalAmount = items?.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    ) ?? 0;

    // Delete old items and recreate
    await prisma.orderItem.deleteMany({ where: { orderId: params.id } });

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        clientId,
        paymentType,
        note,
        status,
        paymentStatus,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Number(item.price),
            total: Number(item.price) * Number(item.quantity),
          })),
        },
      },
      include: {
        client: true,
        agent: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating order" }, { status: 500 });
  }
}