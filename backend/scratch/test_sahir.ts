import prisma from '../src/db';

async function test() {
   const users = await prisma.user.findMany({ where: { name: 'Sahir' }});
   console.log('Sahirs:', users);
   process.exit(0);
}

test();
