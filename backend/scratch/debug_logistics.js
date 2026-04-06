const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { jobs: true }
  });
  console.log('Orders & Jobs:', JSON.stringify(orders, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
