import { init } from "@dorilama/instantdb-server";
import { schema, expiresAfter } from "instant";

const APP_ID = process.env["INSTANT_APP_ID"]!;

const { onQuery } = init({ appId: APP_ID, schema });

onQuery(
  {
    notes: {
      $: {
        where: { createdAt: { $isNull: true } },
        limit: 20,
        order: {
          serverCreatedAt: "asc",
        },
      },
    },
  },
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

const interval = 1000;

let lastCheck = Date.now();

function makeExpireQuery() {
  return {
    notes: {
      $: {
        where: {
          or: [
            { createdAt: { $lte: Date.now() - expiresAfter } },
            { createdAt: { $gt: Date.now() + expiresAfter } },
          ],
        },
        limit: 20,
        order: {
          serverCreatedAt: "asc" as const,
        },
      },
    },
  };
}

function scheduleExpireQuery(
  ctx: Parameters<Parameters<typeof onQuery>[1]>[0]
) {
  setTimeout(() => {
    ctx.query.value = makeExpireQuery();
  }),
    Date.now() - (lastCheck + interval);
}

onQuery(makeExpireQuery(), (ctx) => {
  lastCheck = Date.now();
  if (ctx.res.data?.notes?.length) {
    const chunks = ctx.res.data.notes.map((note) => {
      return ctx.db.tx.notes[note.id].delete();
    });
    ctx.db.transact(chunks).then(() => {
      scheduleExpireQuery(ctx);
    });
  } else {
    scheduleExpireQuery(ctx);
  }
});

console.log("started!");
