import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminEmail = "admin@college.edu";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      name: "System Administrator",
    },
    create: {
      email: adminEmail,
      name: "System Administrator",
      role: Role.ADMIN,
      regNo: "ADMIN-001",
    },
  });

  console.log(`Admin user created/verified: ${admin.name} (${admin.email})`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
