import { init, signal, effect, computed } from "@dorilama/instantdb-server";
import { schema, expiresAfter, type Note } from "instant";

const APP_ID = process.env["INSTANT_APP_ID"]!;

const { onQuery, db } = init({ appId: APP_ID, schema });

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
      console.log(`added ${chunks.length} createdAt`, now.value);
      ctx.db.transact(chunks);
    }
  }
);

const maybeExpiredNotes = signal<Note[]>([]);
const maybeInvalidNotes = signal<Note[]>([]);

effect(() => {
  const lte = now.value - expiresAfter;
  const notes: Note[] = [];
  for (let note of maybeExpiredNotes.value) {
    if (note.createdAt && note.createdAt <= lte) {
      notes.push(note);
    } else {
      break;
    }
  }

  if (notes.length) {
    const chunks = notes.map((note) => {
      return db.tx.notes[note.id].delete();
    });
    console.log(
      `deleted ${chunks.length} expired`,
      notes.map((note) => note.createdAt),
      `now: ${now.value}`,
      `lte: ${lte}`
    );
    db.transact(chunks);
  }
});

effect(() => {
  const gt = now.value + expiresAfter + 1000 * 5;
  const notes: Note[] = [];
  for (let note of maybeInvalidNotes.value) {
    if (note.createdAt && note.createdAt > gt) {
      notes.push(note);
    } else {
      break;
    }
  }

  if (notes.length) {
    const chunks = notes.map((note) => {
      return db.tx.notes[note.id].delete();
    });
    console.log(
      `deleted ${chunks.length} invalid`,
      notes.map((note) => note.createdAt),
      `now: ${now.value}`,
      `gt: ${gt}`
    );
    db.transact(chunks);
  }
});

onQuery(
  {
    notes: {
      $: {
        where: { createdAt: { $isNull: false } },
        limit: 20,
        order: {
          createdAt: "asc",
        },
      },
    },
  },
  (ctx) => {
    maybeExpiredNotes.value = ctx.res.data?.notes || [];
  }
);

onQuery(
  {
    notes: {
      $: {
        where: { createdAt: { $isNull: false } },
        limit: 20,
        order: {
          createdAt: "desc",
        },
      },
    },
  },
  (ctx) => {
    maybeInvalidNotes.value = ctx.res.data?.notes || [];
  }
);

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
        ctx.res.data.notes.map((note) => note.createdAt),
        now.value
      );
      ctx.db.transact(chunks);
    }
  }
);

console.log("started!");
