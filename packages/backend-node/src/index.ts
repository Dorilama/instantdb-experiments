import { init, signal, effect, computed } from "@dorilama/instantdb-server";
import { schema, expiresAfter } from "instant";

const APP_ID = process.env["INSTANT_APP_ID"]!;

const { onQuery } = init({ appId: APP_ID, schema });

const interval = 1000 * 1;

const now = signal(Date.now());
setInterval(() => {
  now.value = Date.now();
}, interval);

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
      const localNow = Date.now();
      const chunks = ctx.res.data.notes.map((note) => {
        return ctx.db.tx.notes[note.id].update({ createdAt: localNow });
      });
      console.log(
        `added ${chunks.length} createdAt`,
        JSON.stringify(ctx.res.data.notes, null, 2),
        new Date(now.value).toISOString()
      );
      ctx.db.transact(chunks);
    }
  }
);

const expireQuery = computed(() => {
  return {
    notes: {
      $: {
        where: {
          or: [
            { createdAt: { $lte: now.value - expiresAfter } },
            { createdAt: { $gt: now.value + expiresAfter + 1000 * 5 } },
          ],
        },
        limit: 20,
        order: {
          serverCreatedAt: "asc" as const,
        },
      },
    },
  };
});

onQuery(expireQuery, (ctx) => {
  if (ctx.res.data?.notes?.length) {
    const chunks = ctx.res.data.notes.map((note) => {
      return ctx.db.tx.notes[note.id].delete();
    });
    console.log(
      `deleted ${chunks.length}`,
      JSON.stringify(ctx.res.data.notes, null, 2),
      new Date(now.value).toISOString(),
      JSON.stringify(ctx.query.value, null, 2)
    );
    ctx.db.transact(chunks);
  }
});

onQuery(
  {
    notes: {
      $: {
        where: { title: { $ilike: "%hello%" } },
        limit: 20,
        order: {
          serverCreatedAt: "asc",
        },
      },
    },
  },
  (ctx) => {
    if (ctx.res.data?.notes?.length) {
      const chunks = ctx.res.data.notes.map((note) => {
        return ctx.db.tx.notes[note.id].update({
          title: note.title.replaceAll(/hello/gi, (match) => {
            return (
              match.slice(0, 1) + "*".repeat(match.length - 2) + match.slice(-1)
            );
          }),
          label: "flagged",
        });
      });
      console.log(
        `flagged ${chunks.length}`,
        JSON.stringify(ctx.res.data.notes, null, 2),
        new Date(now.value).toISOString()
      );
      ctx.db.transact(chunks);
    }
  }
);

console.log("started!");
