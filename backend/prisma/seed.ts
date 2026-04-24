import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ✅ Create admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@deepiping.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@deepiping.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);
  console.log("📧 Email: admin@deepiping.com");
  console.log("🔑 Password: Admin@123");

  // ✅ Seed rooms
  const rooms = [
    { name: "Small Conference-1", capacity: 6 },
    { name: "Small Conference-2", capacity: 6 },
    { name: "Small Conference-3", capacity: 6 },
    { name: "Small Conference-4", capacity: 6 },
    { name: "Big Conference-1", capacity: 20 },
    { name: "Big Conference-2", capacity: 20 },
    { name: "Auditorium-1", capacity: 100 },
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
