import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ✅ Create admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "amit.chhotaray@deepiping.com" },
    update: {
      role: "ADMIN",
      status: "APPROVED",
    },
    create: {
      name: "Amit(Admin)",
      email: "amit.chhotaray@deepiping.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  console.log("✅ Admin user created:", admin.email);
  console.log("📧 Email: amit.chhotaray@deepiping.com");
  console.log("🔑 Password: Admin@123");

  // ✅ Seed Plant 2 rooms
  const rooms = [
    { name: "Small Conference-1", capacity: 20 },
    { name: "Small Conference-2", capacity: 20 },
    { name: "Board Room", capacity: 20 },
    { name: "Training Room", capacity: 30 },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {},
      create: room,
    });
  }

  console.log("✅ Rooms seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());