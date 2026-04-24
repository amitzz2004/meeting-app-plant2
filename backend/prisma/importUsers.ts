import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function importUsers() {
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, "users.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.trim().split("\n");
    
    // Remove header row
    const headers = lines[0].split(",");
    const rows = lines.slice(1);

    console.log(`📋 Found ${rows.length} users to import...`);

    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      const values = row.split(",");
      const user = {
        name: values[0]?.trim(),
        email: values[1]?.trim(),
        password: values[2]?.trim(),
        department: values[3]?.trim() || null,
      };

      // Skip if missing required fields
      if (!user.name || !user.email || !user.password) {
        console.log(`⚠️ Skipping invalid row: ${row}`);
        skipped++;
        continue;
      }

      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (existing) {
        console.log(`⏭️ Skipping existing user: ${user.email}`);
        skipped++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Create user
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          department: user.department,
          role: "USER",
          status: "APPROVED", // ✅ auto approved
        },
      });

      console.log(`✅ Created: ${user.name} (${user.email})`);
      created++;
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Created: ${created} users`);
    console.log(`⏭️ Skipped: ${skipped} users`);

  } catch (error) {
    console.error("❌ Import failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importUsers();