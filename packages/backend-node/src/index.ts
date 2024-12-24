import { init, signal, effect, computed } from "@dorilama/instantdb-server";
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

const interval = 1000 * 1;

const now = signal(Date.now());
setInterval(() => {
  now.value = Date.now();
}, interval);

const expireQuery = computed(() => {
  return {
    notes: {
      $: {
        where: {
          or: [
            { createdAt: { $lte: now.value - expiresAfter } },
            { createdAt: { $gt: now.value + expiresAfter } },
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
    ctx.db.transact(chunks);
  }
});

// onQuery(
//   {
//     notes: {
//       $: {
//         where: { $ilike: "%hello%" },
//         limit: 20,
//         order: {
//           serverCreatedAt: "asc",
//         },
//       },
//     },
//   },
//   (ctx) => {
//     console.log(ctx.res.data?.notes?.length);
//     if (ctx.res.data?.notes?.length) {
//       const chunks = ctx.res.data.notes.map((note) => {
//         return ctx.db.tx.notes[note.id].update({
//           title: note.title.replaceAll(/hello/g, "h***o"),
//         });
//       });
//       ctx.db.transact(chunks);
//     }
//   }
// );

console.log("started!");
