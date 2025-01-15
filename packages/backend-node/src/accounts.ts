import {
  signal,
  effect,
  id,
  InstantByosServerDatabase,
} from "@dorilama/instantdb-server";
import type { InstantAdminDatabase } from "@instantdb/admin";
import { expiresAfter } from "instant";
import type { AppSchema } from "instant";

const prefix = "[ACCOUNTS]: ";
let started = false;

const usersToDelete = new Set();

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
      const chunks = data.value.$users
        .filter((user) => {
          const isToDelete = usersToDelete.has(user.id);
          console.log(user.email, !isToDelete);
          return !isToDelete;
        })
        .map((user) => {
          const accountId = id();
          return db.tx.accounts[accountId]
            .update({ createdAt: localNow })
            .link({ owner: user.id });
        });
      if (chunks.length) {
        console.log(
          `${prefix}added ${chunks.length} accounts`,
          localNow,
          now.value,
          process.env.DEV
            ? data.value.$users.map((user) => user.email)
            : ["redacted"]
        );
        db.transact(chunks);
      }
    }
  });

  function stopCreated() {
    createdQuery.stop();
    stopCreatedEffect();
  }

  const expiredQuery = db.useQuery({
    accounts: {
      owner: {},
      $: {
        limit: 20,
        order: {
          createdAt: "asc",
        },
      },
    },
  });

  const stopExpiredEffect = effect(() => {
    const { data } = expiredQuery;
    const lte = now.value - expiresAfter.accounts;

    const accounts = (
      data.value?.accounts.filter((account) => {
        return account.createdAt && account.createdAt <= lte;
      }) || []
    ).map((account) => {
      return { account, email: account.owner?.email, id: account.owner?.id };
    });

    accounts.forEach((account) => {
      usersToDelete.add(account.id);
    });

    if (accounts.length) {
      console.log(
        `${prefix}deleted ${accounts.length} expired`,
        accounts.map(({ account }) => account.createdAt),
        `now: ${now.value}`,
        `lte: ${lte}`,
        process.env.DEV
          ? accounts.map(({ email }) => email || "noemail")
          : ["redacted"]
      );

      db.transact(
        accounts.map(({ account }) => {
          return db.tx.accounts[account.id].delete();
        })
      );

      accounts.forEach(({ email, id }) => {
        if (!id) {
          return;
        }
        adminDb.auth
          .deleteUser({ id })
          .then(() => {
            setTimeout(() => {
              usersToDelete.delete(id);
            }, 1000);

            console.log(
              `${prefix} deleted user ${process.env.DEV ? (email || "noemail") + ` ${id}` : "redacted"}`
            );
          })
          .catch((error) => {
            console.error(
              `error deleting account ${email || "noemail"}, ${id}`,
              error
            );
          });
      });
    }
  });

  function stopExpired() {
    expiredQuery.stop();
    stopExpiredEffect();
  }

  function stop() {
    stopCreated();
    stopExpired();
    clearInterval(intervalId);
  }

  started = true;

  return stop;
}
