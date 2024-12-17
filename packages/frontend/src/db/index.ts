import {
  init_experimental,
  type InstaQLParams,
  type InstaQLResult,
} from "@dorilama/instantdb-vue";
import { schema } from "instant";

export const db = init_experimental({
  appId: import.meta.env.VITE_INSTANT_APP_ID,
  schema,
});
