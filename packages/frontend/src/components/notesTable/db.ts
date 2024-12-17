import type { InstaQLParams, InstaQLResult } from "@dorilama/instantdb-vue";
import { schema } from "instant";

export const allNotesQuery = { notes: {} } satisfies InstaQLParams<
  typeof schema
>;

export type AllNotesResult = InstaQLResult<typeof schema, typeof allNotesQuery>;
