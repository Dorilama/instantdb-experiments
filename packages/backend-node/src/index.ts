import { init } from "@dorilama/instantdb-server";
import { schema } from "instant";
import { startNotes } from "./notes.ts";

export const adminEmail = "server@mariano.dev";

const APP_ID = process.env["INSTANT_APP_ID"]!;

const db = init({ appId: APP_ID, schema });

const stopNotes = startNotes(db);

process.on("SIGINT", () => {
  console.log("cleaning up");
  stopNotes();
  console.log("all clean");
  process.exit(0);
});

console.log("started!");
