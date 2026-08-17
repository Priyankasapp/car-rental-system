import "server-only";
import { prisma } from "@/lib/prisma";
import { buildCarSlug } from "@/lib/slug";

export async function generateUniqueCarSlug(
  manufacturer: string,
  model: string,
  year: number,
  excludeId?: string
): Promise<string> {
  const base = buildCarSlug(manufacturer, model, year);
  let slug = base;
  let counter = 2;

  while (
    await prisma.car.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}