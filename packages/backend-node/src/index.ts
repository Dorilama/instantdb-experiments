import { init, signal, effect, computed } from "@dorilama/instantdb-server";
import { schema, expiresAfter, type Note } from "instant";

const APP_ID = process.env["INSTANT_APP_ID"]!;

const { onQuery, db } = init({ appId: APP_ID, schema });

const interval = 1000 * 1;

const now = signal(Date.now());
const intervalId = setInterval(() => {
  now.value = Date.now();
}, interval);

const stopCreatedQuery = onQuery(
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
      console.log(`added ${chunks.length} createdAt`, localNow, now.value);
      ctx.db.transact(chunks);
    }
  }
);

const maybeExpiredNotes = signal<Note[]>([]);
const maybeInvalidNotes = signal<Note[]>([]);

const stopExpiredEffect = effect(() => {
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

const stopInvalidEffect = effect(() => {
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

const stopExpiredQuery = onQuery(
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

const stopInvalidQuery = onQuery(
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

const stopRedactedQuery = onQuery(
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

process.on("SIGINT", () => {
  console.log("cleaning up");
  stopCreatedQuery();
  stopExpiredQuery();
  stopInvalidQuery();
  stopRedactedQuery();
  stopExpiredEffect();
  stopInvalidEffect();
  clearInterval(intervalId);
  console.log("all clean");
  process.exit(0);
});

console.log("started!");
