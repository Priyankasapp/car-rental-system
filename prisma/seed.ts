import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning UrbanDrive database...");

  // Delete dependent/related data first if required by your schema.
  // Then delete users.
  await prisma.oTP.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Existing users and OTPs removed");

  const password = "SuperAdmin@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@urbandrive.com",
      firstName: "Super",
      lastName: "Admin",
      phone: "+91 98765 43000",
      password: hashedPassword,
      role: "SUPERADMIN" as Role,

      isEmailVerified: true,
      isActive: true,
      isDeleted: false,

      profilePicture:
        "https://ui-avatars.com/api/?name=Super+Admin&background=1a1a1a&color=ffffff&size=128",

      preferences: {
        language: "en",
        currency: "INR",
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
      },
    },
  });

  console.log("👑 Super Admin created");
  console.log(`📧 Email: ${superAdmin.email}`);
  console.log(`🔑 Password: ${password}`);
}

main()
  .catch((error) => {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });