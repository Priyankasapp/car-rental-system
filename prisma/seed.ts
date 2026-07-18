// prisma/seed.ts
import { PrismaClient, CarCategory, Transmission, FuelType, CarStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Super Admin
  const adminEmail = 'admin@urbandrive.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPERADMIN',
        isEmailVerified: true,
        isActive: true,
      },
    })
    console.log('✅ Super Admin created')
  } else {
    console.log('ℹ️ Super Admin already exists')
  }

  // 2. Create Sample Cars with correct enum types
  const sampleCars = [
    {
      manufacturer: 'Toyota',
      model: 'Camry',
      year: 2023,
      category: 'SEDAN' as CarCategory,
      licensePlate: 'ABC-1234',
      color: 'Silver',
      transmission: 'AUTOMATIC' as Transmission,
      fuelType: 'PETROL' as FuelType,
      seats: 5,
      luggageCapacity: 4,
      features: ['GPS', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
      pricePerDay: 5000,
      pricePerWeek: 30000,
      pricePerMonth: 120000,
      securityDeposit: 20000,
      mileageFree: 100,
      mileageExtraFee: 50,
      locationAddress: '123 Main St',
      locationCity: 'New York',
      locationState: 'NY',
      locationZipCode: '10001',
      imageMain: 'https://images.unsplash.com/photo-1606016159991-dfe4f974be5c?auto=format&fit=crop&q=80&w=600',
      imageGallery: [
        'https://images.unsplash.com/photo-1606016159991-dfe4f974be5c?auto=format&fit=crop&q=80&w=600',
      ],
      status: 'AVAILABLE' as CarStatus,
    },
    {
      manufacturer: 'Honda',
      model: 'CR-V',
      year: 2023,
      category: 'SUV' as CarCategory,
      licensePlate: 'XYZ-5678',
      color: 'Blue',
      transmission: 'AUTOMATIC' as Transmission,
      fuelType: 'HYBRID' as FuelType,
      seats: 5,
      luggageCapacity: 6,
      features: ['GPS', 'Bluetooth', 'Sunroof', 'Lane Assist'],
      pricePerDay: 7000,
      pricePerWeek: 42000,
      pricePerMonth: 168000,
      securityDeposit: 25000,
      mileageFree: 100,
      mileageExtraFee: 50,
      locationAddress: '456 Park Ave',
      locationCity: 'New York',
      locationState: 'NY',
      locationZipCode: '10002',
      imageMain: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
      imageGallery: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
      ],
      status: 'AVAILABLE' as CarStatus,
    },
    {
      manufacturer: 'Tesla',
      model: 'Model 3',
      year: 2024,
      category: 'LUXURY' as CarCategory,
      licensePlate: 'TES-7890',
      color: 'Red',
      transmission: 'AUTOMATIC' as Transmission,
      fuelType: 'ELECTRIC' as FuelType,
      seats: 5,
      luggageCapacity: 4,
      features: ['GPS', 'Bluetooth', 'Autopilot', 'Premium Sound'],
      pricePerDay: 12000,
      pricePerWeek: 72000,
      pricePerMonth: 288000,
      securityDeposit: 50000,
      mileageFree: 0,
      mileageExtraFee: 0,
      locationAddress: '789 Broadway',
      locationCity: 'New York',
      locationState: 'NY',
      locationZipCode: '10003',
      imageMain: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=600',
      imageGallery: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=600',
      ],
      status: 'AVAILABLE' as CarStatus,
    },
    {
      manufacturer: 'BMW',
      model: 'X5',
      year: 2023,
      category: 'SUV' as CarCategory,
      licensePlate: 'BMW-4321',
      color: 'Black',
      transmission: 'AUTOMATIC' as Transmission,
      fuelType: 'PETROL' as FuelType,
      seats: 5,
      luggageCapacity: 7,
      features: ['GPS', 'Bluetooth', 'Sunroof', 'Leather Seats'],
      pricePerDay: 9500,
      pricePerWeek: 57000,
      pricePerMonth: 228000,
      securityDeposit: 35000,
      mileageFree: 100,
      mileageExtraFee: 50,
      locationAddress: '321 5th Ave',
      locationCity: 'Los Angeles',
      locationState: 'CA',
      locationZipCode: '90001',
      imageMain: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600',
      imageGallery: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600',
      ],
      status: 'AVAILABLE' as CarStatus,
    },
    {
      manufacturer: 'Mercedes',
      model: 'C-Class',
      year: 2024,
      category: 'LUXURY' as CarCategory,
      licensePlate: 'MBZ-9876',
      color: 'White',
      transmission: 'AUTOMATIC' as Transmission,
      fuelType: 'PETROL' as FuelType,
      seats: 5,
      luggageCapacity: 4,
      features: ['GPS', 'Bluetooth', 'Sunroof', 'Parking Sensors'],
      pricePerDay: 11000,
      pricePerWeek: 66000,
      pricePerMonth: 264000,
      securityDeposit: 45000,
      mileageFree: 100,
      mileageExtraFee: 50,
      locationAddress: '654 Madison Ave',
      locationCity: 'Los Angeles',
      locationState: 'CA',
      locationZipCode: '90002',
      imageMain: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600',
      imageGallery: [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600',
      ],
      status: 'AVAILABLE' as CarStatus,
    },
  ]

  for (const carData of sampleCars) {
    const existingCar = await prisma.car.findUnique({
      where: { licensePlate: carData.licensePlate },
    })

    if (!existingCar) {
      await prisma.car.create({
        data: carData,
      })
      console.log(`✅ Car added: ${carData.manufacturer} ${carData.model}`)
    } else {
      console.log(`ℹ️ Car already exists: ${carData.manufacturer} ${carData.model}`)
    }
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })