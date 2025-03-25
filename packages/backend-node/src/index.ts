import { init, effect } from "@dorilama/instantdb-server";
import { init as initAdmin } from "@instantdb/admin";
import { schema } from "instant";
import { startNotes } from "./notes.ts";
import { startAccounts } from "./accounts.ts";

export const adminEmail = process.env["ADMIN_EMAIL"];

let shutDownTimer = setTimeout(
  () => {
    console.log("restarting");
    process.exit(0);
  },
  1000 * 60 * 60 * 12
);

const APP_ID = process.env["INSTANT_APP_ID"]!;
const ADMIN_SECRET = process.env["INSTANT_ADMIN_SECRET"]!;

const adminDb = initAdmin({ appId: APP_ID, adminToken: ADMIN_SECRET, schema });
const token = await adminDb.auth.createToken(adminEmail);

const db = init({ appId: APP_ID, schema });
const { isLoading, user } = db.useAuth();

const conneCtionStatus = db.useConnectionStatus();

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

const allGoodConnectionStatus: (typeof conneCtionStatus.value)[] = [
  "authenticated",
  "connecting",
  "opened",
];

effect(() => {
  if (
    !allGoodConnectionStatus.includes(conneCtionStatus.value) &&
    !user.value
  ) {
    console.log(
      `bad connectionStatus: ${conneCtionStatus.value}. user: ${!!user.value}`
    );
    process.exit(1);
  }
});

const stopNotes = startNotes(db);
const stopAccounts = startAccounts(db, adminEmail, adminDb);

process.on("SIGINT", () => {
  console.log("cleaning up");
  stopNotes?.();
  stopAccounts?.();
  console.log("all clean");
  process.exit(0);
});

console.log("started!");
