import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      // Prisma's generated client is a build artefact and is absent in CI.
      // Its enums are plain objects, so a hand-kept stub lets the real
      // modules under test import them. See tests/setup/prisma-enums.ts.
      '@prisma/client': path.resolve(root, 'tests/setup/prisma-enums.ts'),
      // Some modules import the client at top level alongside pure helpers.
      // The stub throws on any actual query. See tests/setup/prisma-stub.ts.
      '@/lib/prisma': path.resolve(root, 'tests/setup/prisma-stub.ts'),
      '@': root,
    },
  },
})
