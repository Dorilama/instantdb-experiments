import { init, i, id, type InstaQLEntity } from "@dorilama/instantdb-server";
import { schema } from "instant";

const APP_ID = process.env["INSTANT_APP_ID"]!;

type Note = InstaQLEntity<typeof schema, "notes">;

const { onQuery } = init({ appId: APP_ID, schema });

onQuery(
  { notes: { $: { where: { createdAt: { $isNull: true } }, limit: 20 } } },
  (ctx) => {
    if (ctx.res.data?.notes?.length) {
      const now = Date.now();
      const chunks = ctx.res.data.notes.map((note) => {
        return ctx.db.tx.notes[note.id].update({ createdAt: now });
      });
      ctx.db.transact(chunks);
    }
  }
);

console.log("started!");
