// tests/setup/prisma-stub.ts
//
// Several modules mix pure functions with Prisma-backed ones in the same file
// (lib/booking-utils.ts is the clearest case: mapActionToStatus and
// isValidStatusTransition are pure, but the module also imports the client at
// top level). Importing the module for the pure functions therefore
// instantiates PrismaClient, which fails without a generated client.
//
// This stub satisfies the import. Every property access throws, so if a test
// ever reaches the database by accident it fails loudly with a clear message
// instead of silently returning undefined and asserting on nothing.

const explode = (path: string): never => {
  throw new Error(
    `Test tried to use the database: prisma.${path}(). ` +
      `These tests are unit tests over pure logic. Either keep the code under ` +
      `test free of Prisma calls, or write an integration test with a real ` +
      `MongoDB instance.`
  )
}

export const prisma: unknown = new Proxy(
  {},
  {
    get(_target, model: string) {
      if (model === 'then') return undefined // don't look thenable to await
      return new Proxy(
        {},
        {
          get(_t, method: string) {
            return () => explode(`${model}.${method}`)
          },
        }
      )
    },
  }
)

export default prisma
