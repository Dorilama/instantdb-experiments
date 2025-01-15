import { init, effect } from "@dorilama/instantdb-server";
import { init as initAdmin } from "@instantdb/admin";
import { schema } from "instant";
import { startNotes } from "./notes.ts";

export const adminEmail = "server@mariano.dev";

const APP_ID = process.env["INSTANT_APP_ID"]!;
const ADMIN_SECRET = process.env["INSTANT_ADMIN_SECRET"]!;

const adminDb = initAdmin({ appId: APP_ID, adminToken: ADMIN_SECRET, schema });
const token = await adminDb.auth.createToken(adminEmail);

const db = init({ appId: APP_ID, schema });
const { isLoading, user } = db.useAuth();

let stopNotes: (() => void) | undefined;

effect(() => {
  if (isLoading.value || user.value) {
    return;
  }
  db.auth.signInWithToken(token);
});

effect(() => {
  if (user.value) {
    console.log(`logged in as ${user.value.email}`);
  }
});

stopNotes = startNotes(db);

process.on("SIGINT", () => {
  console.log("cleaning up");
  stopNotes?.();
  console.log("all clean");
  process.exit(0);
});

console.log("started!");
