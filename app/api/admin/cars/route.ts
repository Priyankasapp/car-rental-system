// app/api/admin/cars/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CarCreateSchema } from "@/lib/cars/validation";
import { authorizeUser } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/api-handler";


// GET /api/admin/cars

async function handleGET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.CARS_VIEW);

  if (!authResult.isAuth) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search");
  const categoryId = searchParams.get("categoryId");
  const fuelTypeId = searchParams.get("fuelTypeId");
  const transmissionId = searchParams.get("transmissionId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (search) {
    // MongoDB via Prisma — case-sensitive match (no `mode: insensitive`)
    where.OR = [
      { manufacturer: { contains: search } },
      { model: { contains: search } },
      { licensePlate: { contains: search } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (fuelTypeId) where.fuelTypeId = fuelTypeId;
  if (transmissionId) where.transmissionId = transmissionId;
  if (status) where.status = status;

  const cars = await prisma.car.findMany({
    where,
    include: {
      category: {
        select: { id: true, name: true },
      },
      fuelType: {
        select: { id: true, name: true },
      },
      transmission: {
        select: { id: true, name: true },
      },
      featureMasters: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    { success: true, data: cars },
    { status: 200 }
  );
}


// POST /api/admin/cars
async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authorizeUser(request, PERMISSIONS.CARS_CREATE);

  if (!authResult.isAuth) {
    return authResult.response;
  }

  const body = await request.json();

  //  ZodError will bubble up → caught by withErrorHandler → 400
  const parsed = CarCreateSchema.parse(body);

  // Check for duplicate license plate
  const existingCar = await prisma.car.findUnique({
    where: { licensePlate: parsed.licensePlate },
  });

  if (existingCar) {
    return NextResponse.json(
      {
        success: false,
        message: "A vehicle with this license plate already exists.",
      },
      { status: 409 }
    );
  }

  // Verify referenced featureIds actually exist
  let validFeatureIds: string[] = [];
  let featureNames: string[] = [];

  if (parsed.featureIds.length > 0) {
    const foundFeatures = await prisma.carFeatureMaster.findMany({
      where: { id: { in: parsed.featureIds } },
      select: { id: true, name: true },
    });

    validFeatureIds = foundFeatures.map((f) => f.id);
    featureNames = foundFeatures.map((f) => f.name);
  }

  const imageMain = parsed.imageMain ?? parsed.imageGallery[0];

  const newCar = await prisma.car.create({
    data: {
      manufacturer: parsed.manufacturer,
      model: parsed.model,
      year: parsed.year,
      licensePlate: parsed.licensePlate,
      color: parsed.color ?? null,
      seats: parsed.seats,
      luggageCapacity: parsed.luggageCapacity,

      pricePerDay: parsed.pricePerDay,
      pricePerWeek: parsed.pricePerWeek ?? null,
      pricePerMonth: parsed.pricePerMonth ?? null,
      securityDeposit: parsed.securityDeposit,

      mileageFree: parsed.mileageFree ?? null,
      mileageExtraFee: parsed.mileageExtraFee ?? null,

      locationAddress: parsed.locationAddress,
      locationCity: parsed.locationCity,
      locationState: parsed.locationState,
      locationZipCode: parsed.locationZipCode,

      imageMain,
      imageGallery: parsed.imageGallery,

      features: featureNames,
      featureIds: validFeatureIds,

      status: parsed.status,
      isPublished: true,
      isFeatured: false,

      categoryId: parsed.categoryId ?? null,
      transmissionId: parsed.transmissionId ?? null,
      fuelTypeId: parsed.fuelTypeId ?? null,
    },
    include: {
      category: true,
      fuelType: true,
      transmission: true,
      featureMasters: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: newCar,
      message: "Car created successfully",
    },
    { status: 201 }
  );
}


// Exports
export const GET = withErrorHandler(handleGET);
export const POST = withErrorHandler(handlePOST);