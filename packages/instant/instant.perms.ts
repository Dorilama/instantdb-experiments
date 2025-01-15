// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core";

const rules = {
  /**
   * Welcome to Instant's permission system!
   * Right now your rules are empty. To start filling them in, check out the docs:
   * https://www.instantdb.com/docs/permissions
   *
   * Here's an example to give you a feel:
   * posts: {
   *   allow: {
   *     view: "true",
   *     create: "isOwner",
   *     update: "isOwner",
   *     delete: "isOwner",
   *   },
   *   bind: ["isOwner", "data.creator == auth.uid"],
   * },
   */
  $users: {
    allow: {
      view: "isOwner || isServerAdmin",
      create: "false",
      delete: "false",
      update: "false",
    },
    bind: [
      "isOwner",
      "auth.id == data.id",
      "isServerAdmin",
      `auth.email in ['server@mariano.dev']`,
    ],
  },
  notes: {
    allow: {
      $default: "isPublic || isOwner || isServerAdmin",
    },
    bind: [
      "isPublic",
      "data.owner == null",
      "isOwner",
      "auth.id != null && data.owner!= null && auth.id in data.ref('owner.id')",
      "isServerAdmin",
      `auth.email in ['server@mariano.dev']`,
    ],
  },
  accounts: {
    allow: {
      $default: "isServerAdmin",
      view: "isOwner || isServerAdmin",
    },
    bind: [
      "isOwner",
      "auth.id != null && data.owner!= null && auth.id in data.ref('owner.id')",
      "isServerAdmin",
      `auth.email in ['server@mariano.dev']`,
    ],
  },
} satisfies InstantRules;

export default rules;
