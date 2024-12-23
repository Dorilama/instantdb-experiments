import {
  init,
  id,
  type InstaQLParams,
  type InstaQLResult,
} from "@dorilama/instantdb-vue";
import { schema } from "instant";

if (import.meta.env.DEV) {
  localStorage.setItem("__instantLogging", "true");
}

const db = init({
  appId: import.meta.env.VITE_INSTANT_APP_ID,
  schema,
});

export { db, id, type InstaQLParams, type InstaQLResult };
