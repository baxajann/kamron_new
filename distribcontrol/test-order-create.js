const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const clients = await prisma.client.findMany({ take: 1 });
    const products = await prisma.product.findMany({ take: 1 });
    
    if (clients.length === 0 || products.length === 0) {
      console.log("No data");
      return;
    }

    const payload = {
      clientId: clients[0].id,
      paymentType: "TRANSFER",
      note: "Test notes",
      status: "NEW",
      paymentStatus: "UNPAID",
      totalAmount: 1000,
      orderNumber: "ORD-99999",
      items: {
        create: [{
           productId: products[0].id,
           quantity: 1,
           price: 1000,
           total: 1000
        }]
      }
    };

    const order = await prisma.order.create({
      data: payload
    });
    console.log("Success! Order ID:", order.id);
    
    await prisma.order.delete({ where: { id: order.id } });
  } catch (e) {
    console.error("Failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
