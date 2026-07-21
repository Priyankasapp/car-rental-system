// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // ============== 1. CREATE SUPER ADMIN ==============
  console.log('👑 Creating Super Admin...')

  const superAdminData = {
    email: 'superadmin@urbandrive.com',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+91 98765 43000',
    password: 'SuperAdmin@123',
    role: 'SUPERADMIN' as Role,
  }

  try {
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminData.email },
    })

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(superAdminData.password, 10)
      
      await prisma.user.create({
        data: {
          email: superAdminData.email,
          firstName: superAdminData.firstName,
          lastName: superAdminData.lastName,
          phone: superAdminData.phone,
          password: hashedPassword,
          role: superAdminData.role,
          isEmailVerified: true,
          isActive: true,
          isDeleted: false,
          profilePicture: `https://ui-avatars.com/api/?name=Super+Admin&background=1a1a1a&color=ffffff&size=128`,
          preferences: {
            language: 'en',
            currency: 'INR',
            notifications: { email: true, push: true, sms: true },
          },
        },
      })
      console.log(`✅ Super Admin created: ${superAdminData.email}`)
    } else {
      console.log(`ℹ️ Super Admin already exists: ${superAdminData.email}`)
    }
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error)
  }

  // ============== 2. CREATE ADMINS ==============
  console.log('👥 Creating Admins...')

  const adminData = [
    {
      email: 'admin1@urbandrive.com',
      firstName: 'Raj',
      lastName: 'Kumar',
      phone: '+91 98765 43101',
      password: 'Admin@123',
      role: 'ADMIN' as Role,
    },
    {
      email: 'admin2@urbandrive.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 98765 43102',
      password: 'Admin@123',
      role: 'ADMIN' as Role,
    },
    {
      email: 'admin3@urbandrive.com',
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '+91 98765 43103',
      password: 'Admin@123',
      role: 'ADMIN' as Role,
    },
  ]

  for (const admin of adminData) {
    try {
      const existingAdmin = await prisma.user.findUnique({
        where: { email: admin.email },
      })

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(admin.password, 10)
        
        await prisma.user.create({
          data: {
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            phone: admin.phone,
            password: hashedPassword,
            role: admin.role,
            isEmailVerified: true,
            isActive: true,
            isDeleted: false,
            profilePicture: `https://ui-avatars.com/api/?name=${admin.firstName}+${admin.lastName}&background=2d2d2d&color=ffffff&size=128`,
            preferences: {
              language: 'en',
              currency: 'INR',
              notifications: { email: true, push: true, sms: false },
            },
          },
        })
        console.log(`✅ Admin created: ${admin.email}`)
      } else {
        console.log(`ℹ️ Admin already exists: ${admin.email}`)
      }
    } catch (error) {
      console.error(`❌ Error creating admin ${admin.email}:`, error)
    }
  }

  // ============== 3. CREATE STAFF (DRIVERS & CLEANERS) ==============
  console.log('🧑‍🔧 Creating Staff (Drivers & Cleaners)...')

  const staffData = [
    // Drivers
    {
      email: 'driver1@urbandrive.com',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91 98765 43201',
      password: 'Staff@123',
      role: 'STAFF' as Role,
    },
    {
      email: 'driver2@urbandrive.com',
      firstName: 'Suresh',
      lastName: 'Yadav',
      phone: '+91 98765 43202',
      password: 'Staff@123',
      role: 'STAFF' as Role,
    },
    {
      email: 'driver3@urbandrive.com',
      firstName: 'Ravi',
      lastName: 'Kumar',
      phone: '+91 98765 43203',
      password: 'Staff@123',
      role: 'STAFF' as Role,
    },
    // Cleaners
    {
      email: 'cleaner1@urbandrive.com',
      firstName: 'Mohan',
      lastName: 'Das',
      phone: '+91 98765 43301',
      password: 'Staff@123',
      role: 'STAFF' as Role,
    },
    {
      email: 'cleaner2@urbandrive.com',
      firstName: 'Gita',
      lastName: 'Verma',
      phone: '+91 98765 43302',
      password: 'Staff@123',
      role: 'STAFF' as Role,
    },
  ]

  for (const staff of staffData) {
    try {
      const existingStaff = await prisma.user.findUnique({
        where: { email: staff.email },
      })

      if (!existingStaff) {
        const hashedPassword = await bcrypt.hash(staff.password, 10)
        
        await prisma.user.create({
          data: {
            email: staff.email,
            firstName: staff.firstName,
            lastName: staff.lastName,
            phone: staff.phone,
            password: hashedPassword,
            role: staff.role,
            isEmailVerified: true,
            isActive: true,
            isDeleted: false,
            profilePicture: `https://ui-avatars.com/api/?name=${staff.firstName}+${staff.lastName}&background=444444&color=ffffff&size=128`,
            preferences: {
              language: 'en',
              currency: 'INR',
              notifications: { email: true, push: true, sms: true },
            },
          },
        })
        console.log(`✅ Staff created: ${staff.email}`)
      } else {
        console.log(`ℹ️ Staff already exists: ${staff.email}`)
      }
    } catch (error) {
      console.error(`❌ Error creating staff ${staff.email}:`, error)
    }
  }

  // ============== 4. CREATE CUSTOMERS ==============
  console.log('👤 Creating Customers...')

  const customerData = [
    {
      email: 'rahul.sharma@email.com',
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91 98765 43401',
      password: 'Customer@123',
    },
    {
      email: 'priya.patel@email.com',
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+91 98765 43402',
      password: 'Customer@123',
    },
    {
      email: 'amit.kumar@email.com',
      firstName: 'Amit',
      lastName: 'Kumar',
      phone: '+91 98765 43403',
      password: 'Customer@123',
    },
    {
      email: 'sneha.reddy@email.com',
      firstName: 'Sneha',
      lastName: 'Reddy',
      phone: '+91 98765 43404',
      password: 'Customer@123',
    },
    {
      email: 'vikram.singh@email.com',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91 98765 43405',
      password: 'Customer@123',
    },
  ]

  for (const customer of customerData) {
    try {
      const existingCustomer = await prisma.user.findUnique({
        where: { email: customer.email },
      })

      if (!existingCustomer) {
        const hashedPassword = await bcrypt.hash(customer.password, 10)
        
        await prisma.user.create({
          data: {
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            password: hashedPassword,
            role: 'CUSTOMER',
            isEmailVerified: true,
            isActive: true,
            isDeleted: false,
            profilePicture: `https://ui-avatars.com/api/?name=${customer.firstName}+${customer.lastName}&background=666666&color=ffffff&size=128`,
            preferences: {
              language: 'en',
              currency: 'INR',
              notifications: { email: true, push: false, sms: false },
            },
          },
        })
        console.log(`✅ Customer created: ${customer.email}`)
      } else {
        console.log(`ℹ️ Customer already exists: ${customer.email}`)
      }
    } catch (error) {
      console.error(`❌ Error creating customer ${customer.email}:`, error)
    }
  }

  console.log('\n✅ Seeding complete!')
  console.log('\n📋 CREDENTIALS LIST:')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('\n🔹 SUPER ADMIN (Full Access):')
  console.log('   📧 Email: superadmin@urbandrive.com')
  console.log('   🔑 Password: SuperAdmin@123')
  console.log('   👤 Role: SUPERADMIN')
  console.log('───────────────────────────────────────────────────────────────')

  console.log('\n🔹 ADMINS (Management Access):')
  console.log('   📧 Email: admin1@urbandrive.com')
  console.log('   🔑 Password: Admin@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: admin2@urbandrive.com')
  console.log('   🔑 Password: Admin@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: admin3@urbandrive.com')
  console.log('   🔑 Password: Admin@123')
  console.log('───────────────────────────────────────────────────────────────')

  console.log('\n🔹 STAFF (Drivers & Cleaners):')
  console.log('   📧 Email: driver1@urbandrive.com')
  console.log('   🔑 Password: Staff@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: driver2@urbandrive.com')
  console.log('   🔑 Password: Staff@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: driver3@urbandrive.com')
  console.log('   🔑 Password: Staff@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: cleaner1@urbandrive.com')
  console.log('   🔑 Password: Staff@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: cleaner2@urbandrive.com')
  console.log('   🔑 Password: Staff@123')
  console.log('───────────────────────────────────────────────────────────────')

  console.log('\n🔹 CUSTOMERS (Book Cars, View Bookings):')
  console.log('   📧 Email: rahul.sharma@email.com')
  console.log('   🔑 Password: Customer@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: priya.patel@email.com')
  console.log('   🔑 Password: Customer@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: amit.kumar@email.com')
  console.log('   🔑 Password: Customer@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: sneha.reddy@email.com')
  console.log('   🔑 Password: Customer@123')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   📧 Email: vikram.singh@email.com')
  console.log('   🔑 Password: Customer@123')
  console.log('═══════════════════════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })