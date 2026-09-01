const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { regNo: 'RA2411003011067' } });
  console.log("Found user:", user);
}
main().finally(() => prisma.$disconnect());
