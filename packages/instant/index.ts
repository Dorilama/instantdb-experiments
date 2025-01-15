import schema, { type AppSchema } from "./instant.schema.ts";

const expiresAfter = { notes: 30 * 1000, accounts: 60 * 60 * 1000 };

export { type AppSchema, schema, expiresAfter };
