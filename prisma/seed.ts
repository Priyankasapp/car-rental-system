import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning UrbanDrive database...");

  // Delete all dependent child records first, then parent records to avoid relation errors
  await prisma.$transaction([
    prisma.oTP.deleteMany(),
    prisma.emailLog.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.bookingAuditLog.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.session.deleteMany(),
    prisma.reservation.deleteMany(),
    prisma.car.deleteMany(),
    prisma.user.deleteMany(),
    prisma.carFeatureMaster.deleteMany(),
    prisma.categoryMaster.deleteMany(),
    prisma.transmissionMaster.deleteMany(),
    prisma.fuelTypeMaster.deleteMany(),
    prisma.staffMaster.deleteMany(),
  ]);

  console.log(" Database wiped clean!");

  // Create Super Admin
  const password = "SuperAdmin@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@urbandrive.com",
      firstName: "Super",
      lastName: "Admin",
      phone: "+91 98765 43000",
      password: hashedPassword,
      role: Role.SUPERADMIN,

      isEmailVerified: true,
      isActive: true,

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

  console.log("👑 Super Admin created successfully!");
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