// Docs: https://www.instantdb.com/docs/schema

import { i } from "@instantdb/core";

const _schema = i.schema({
  // This section lets you define entities: think `posts`, `comments`, etc
  // Take a look at the docs to learn more:
  // https://www.instantdb.com/docs/schema#defining-entities
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    notes: i.entity({
      title: i.string().indexed(),
      label: i.string().optional(),
      createdAt: i.number().optional().indexed(),
    }),
    accounts: i.entity({
      createdAt: i.number().optional().indexed(),
    }),
  },
  // You can define links here.
  // For example, if `posts` should have many `comments`.
  // More in the docs:
  // https://www.instantdb.com/docs/schema#defining-links
  links: {
    noteOwner: {
      forward: { on: "notes", has: "one", label: "owner" },
      reverse: { on: "$users", has: "many", label: "notes" },
    },
    accountOwner: {
      forward: { on: "accounts", has: "one", label: "owner" },
      reverse: { on: "$users", has: "one", label: "account" },
    },
  },
  // If you use presence, you can define a room schema here
  // https://www.instantdb.com/docs/schema#defining-rooms
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
