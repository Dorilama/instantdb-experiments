import { init, signal, effect } from "@dorilama/instantdb-server";
import { expiresAfter, type Note } from "instant";
import type { AppSchema } from "instant";

let started = false;

export function startNotes(db: ReturnType<typeof init<AppSchema>>) {
  if (started) {
    return;
  }
  const interval = 1000 * 1;

  const now = signal(Date.now());
  const intervalId = setInterval(() => {
    now.value = Date.now();
  }, interval);

  const createdQuery = db.useQuery({
    notes: {
      $: {
        where: { createdAt: { $isNull: true } },
        limit: 20,
        order: {
          serverCreatedAt: "asc",
        },
      },
    },
  });

  const stopCreatedEffect = effect(() => {
    const { data } = createdQuery;
    if (data.value?.notes?.length) {
      const localNow = Date.now();
      const chunks = data.value.notes.map((note) => {
        return db.tx.notes[note.id].update({ createdAt: localNow });
      });
      console.log(`added ${chunks.length} createdAt`, localNow, now.value);
      db.transact(chunks);
    }
  });

  function stopCreated() {
    createdQuery.stop();
    stopCreatedEffect();
  }

  const expiredQuery = db.useQuery({
    notes: {
      $: {
        where: { createdAt: { $isNull: false } },
        limit: 20,
        order: {
          createdAt: "asc",
        },
      },
    },
  });

  const stopExpiredEffect = effect(() => {
    const { data } = expiredQuery;
    const lte = now.value - expiresAfter;
    const notes: Note[] = [];
    for (let note of data.value?.notes || []) {
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

  function stopExpired() {
    expiredQuery.stop();
    stopExpiredEffect();
  }

  const invalidQuery = db.useQuery({
    notes: {
      $: {
        where: { createdAt: { $isNull: false } },
        limit: 20,
        order: {
          createdAt: "desc",
        },
      },
    },
  });

  const stopInvalidEffect = effect(() => {
    const { data } = invalidQuery;
    const gt = now.value + expiresAfter + 1000 * 5;
    const notes: Note[] = [];
    for (let note of data.value?.notes || []) {
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

  function stopInvalid() {
    invalidQuery.stop();
    stopInvalidEffect();
  }

  const toRedactQuery = db.useQuery({
    notes: {
      $: {
        where: { title: { $ilike: "%hello%" } },
        limit: 20,
        order: {
          serverCreatedAt: "asc",
        },
      },
    },
  });

  const stopToRedactEffect = effect(() => {
    const { data } = toRedactQuery;
    if (data.value?.notes?.length) {
      const chunks = data.value.notes.map((note) => {
        return db.tx.notes[note.id].update({
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
        data.value.notes.map((note) => note.createdAt),
        now.value
      );
      db.transact(chunks);
    }
  });

  function stopToRedact() {
    toRedactQuery.stop();
    stopToRedactEffect();
  }

  function stop() {
    stopCreated();
    stopExpired();
    stopInvalid();
    stopToRedact();
    clearInterval(intervalId);
  }

  started = true;

  return stop;
}
