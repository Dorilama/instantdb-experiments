import schema, { type AppSchema } from "./instant.schema.ts";
import type { InstaQLEntity } from "@instantdb/core";
const expiresAfter = 1000 * 30;
type Note = InstaQLEntity<typeof schema, "notes">;
export { type AppSchema, type Note, schema, expiresAfter };
