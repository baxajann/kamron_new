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

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const deductedStatuses = ["SHIPPED", "IN_TRANSIT", "DELIVERED"];
    const oldWasDeducted = deductedStatuses.includes(existingOrder.status);
    const newIsDeducted = deductedStatuses.includes(status);

    // Business Logic: If moving from a NON-deducted status to a DEDUCTED status
    if (!oldWasDeducted && newIsDeducted) {
       for (const item of existingOrder.items) {
          const inv = await prisma.inventory.findFirst({ where: { productId: item.productId } });
          if (inv) {
             await prisma.inventory.update({
                where: { id: inv.id },
                data: { quantity: { decrement: item.quantity } }
             });
          }
       }
    } 
    // If moving from DEDUCTED status back to NON-deducted (like CANCELLED or RETURNED)
    else if (oldWasDeducted && !newIsDeducted) {
       for (const item of existingOrder.items) {
          const inv = await prisma.inventory.findFirst({ where: { productId: item.productId } });
          if (inv) {
             await prisma.inventory.update({
                where: { id: inv.id },
                data: { quantity: { increment: item.quantity } }
             });
          } else {
             // If missing inventory record, optionally recreate or find a warehouse? 
             // We'll skip as returning the stock shouldn't happen if the product never had stock anyway.
          }
       }
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { client: true, items: true }
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