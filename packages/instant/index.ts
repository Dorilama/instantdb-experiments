import schema, { type AppSchema } from "./instant.schema.ts";
import type { InstaQLEntity } from "@instantdb/core";
const expiresAfter = { notes: 30 * 1000, accounts: 60 * 60 * 1000 };
type Note = InstaQLEntity<typeof schema, "notes">;
type Account = InstaQLEntity<typeof schema, "accounts">;
export { type AppSchema, schema, expiresAfter, type Note, type Account };
