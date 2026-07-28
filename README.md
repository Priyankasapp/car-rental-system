# UrbanDrive

A full-stack car rental management platform built with Next.js, Prisma, and MongoDB. UrbanDrive handles the full rental lifecycle — customer-facing browsing and booking, guest and account-based reservations, and an admin back office for managing the fleet, bookings, staff, and users.

## Features

**Customer-facing**
- Browse and filter the fleet by category, price, and location
- Car detail pages with pricing, features, and availability
- Guest or account-based booking flow with optional add-ons (chauffeur, concierge delivery, satellite connectivity, insurance)
- Account registration, login, and OTP-based email verification / password reset
- View and manage personal bookings
- Contact form for inquiries (chauffeur, corporate, wedding, airport transfer, etc.)

**Admin**
- Dashboard with booking and fleet stats
- Fleet management: add, edit, and remove cars
- Booking management: review, confirm, and cancel reservations
- User management
- Staff management with a role/permission system (Staff Master roles, granular permissions)
- Audit logging for bookings and admin actions

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** MongoDB via Prisma ORM
- **Auth:** JWT (jose / jsonwebtoken) + bcrypt password hashing
- **Email:** Nodemailer / Mailtrap with React Email templates
- **Styling:** Tailwind CSS
- **Animation:** GSAP

## Getting Started

### Prerequisites
- Node.js 20+
- A MongoDB connection string (local or Atlas)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with at least:
   ```bash
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=7d
   # Email (Nodemailer/Mailtrap) and any other provider keys as needed
   ```

3. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

4. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

### Other scripts
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint

## Project Structure

```
app/
  (auth)/       # Login, register, forgot-password
  (public)/     # Fleet browsing, car details, booking, contact, about
  admin/        # Admin dashboard, fleet/booking/staff/user management
  api/          # API routes (auth, cars, reservations, admin, etc.)
components/     # UI components grouped by feature
context/        # React context providers (auth, cars, bookings, admin, permissions)
lib/            # Auth, permissions, email, Prisma client, utilities
prisma/         # Schema and seed script
```

## Status

Actively in development as part of an internship project.