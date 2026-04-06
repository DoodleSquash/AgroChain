import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'itszmesahir134@gmail.com' },
    include: {
      batches: {
        orderBy: { created_at: 'desc' },
        take: 1,
        include: { images: true }
      }
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User ID:', user.id);
  console.log('Newest Listing:', JSON.stringify(user.batches[0], null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
