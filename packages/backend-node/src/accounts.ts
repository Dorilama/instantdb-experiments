import {
  signal,
  effect,
  id,
  InstantByosServerDatabase,
} from "@dorilama/instantdb-server";
import type { InstantAdminDatabase } from "@instantdb/admin";
import { expiresAfter, type Account } from "instant";
import type { AppSchema } from "instant";

const prefix = "[ACCOUNTS]: ";
let started = false;

export function startAccounts(
  db: InstantByosServerDatabase<AppSchema>,
  adminEmail: string,
  adminDb: InstantAdminDatabase<AppSchema>
) {
  if (started) {
    return;
  }
  const interval = 1000 * 1;

  const now = signal(Date.now());
  const intervalId = setInterval(() => {
    now.value = Date.now();
  }, interval);

  const createdQuery = db.useQuery({
    $users: {
      $: {
        where: { account: { $isNull: true }, email: { $not: adminEmail } },
        limit: 20,
        order: {
          serverCreatedAt: "asc",
        },
      },
    },
  });

  const stopCreatedEffect = effect(() => {
    const { data } = createdQuery;
    if (data.value?.$users?.length) {
      const localNow = Date.now();
      const chunks = data.value.$users.map((user) => {
        const accountId = id();
        return db.tx.accounts[accountId]
          .update({ createdAt: localNow })
          .link({ owner: user.id });
      });
      console.log(
        `${prefix}added ${chunks.length} accounts`,
        localNow,
        now.value
      );
      db.transact(chunks);
    }
  });

  function stopCreated() {
    createdQuery.stop();
    stopCreatedEffect();
  }

  // const expiredQuery = db.useQuery({
  //   accounts: {
  //     $: {
  //       limit: 20,
  //       order: {
  //         createdAt: "asc",
  //       },
  //     },
  //   },
  // });

  // const stopExpiredEffect = effect(() => {
  //   const { data } = expiredQuery;
  //   const lte = now.value - expiresAfter.accounts;
  //   const accounts: Account[] = [];
  //   for (let account of data.value?.accounts || []) {
  //     if (account.createdAt && account.createdAt <= lte) {
  //       accounts.push(account);
  //     } else {
  //       break;
  //     }
  //   }

  //   if (accounts.length) {
  //     const chunks: any[] = [];
  //     accounts.forEach((account) => {
  //       chunks.push(
  //         adminDb.tx.notes[account.id].delete(),
  //         adminDb.tx.$users[account.owner.id].delete()
  //       );
  //     });
  //     console.log(
  //       `${prefix}deleted ${chunks.length} expired`,
  //       notes.map((note) => note.createdAt),
  //       `now: ${now.value}`,
  //       `lte: ${lte}`
  //     );
  //     db.transact(chunks);
  //   }
  // });

  // function stopExpired() {
  //   expiredQuery.stop();
  //   stopExpiredEffect();
  // }

  function stop() {
    stopCreated();
    // stopExpired();
    clearInterval(intervalId);
  }

  started = true;

  return stop;
}
