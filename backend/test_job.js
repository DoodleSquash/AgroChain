const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
     const order = await prisma.order.findFirst();
     if (!order) return console.log("No order found");
     console.log("Found order", order.id);

     const token = "tok_transport_test_" + Date.now();
     const type = "TRANSPORT";
     const job = await prisma.job.create({
       data: {
         order_id: order.id,
         type: type,
         token,
         details: { transporter_name: 'John Doe', vehicle: 'MH12AB1234' }
       }
     });
     console.log("Job created!", job.id);
  } catch (e) {
     console.error(e);
  } finally {
     await prisma.$disconnect();
  }
}

test();
