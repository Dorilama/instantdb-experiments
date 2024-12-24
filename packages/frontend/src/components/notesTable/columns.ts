import { ColumnDef } from "@tanstack/vue-table";
import { h } from "vue";
import Badge from "@/components/ui/badge/Badge.vue";
import CountDown from "../countDown/CountDown.vue";
import type { AllNotesResult } from "./db";

export const columns: ColumnDef<AllNotesResult["notes"][number]>[] = [
  {
    accessorKey: "title",
    header: () => h("div", { class: "text-left" }, "Notes"),
    cell: ({ row }) => {
      const { label } = row.original;
      return h("div", { class: "flex space-x-2" }, [
        label ? h(Badge, { variant: "outline" }, () => label) : null,
        h(
          "span",
          { class: "max-w-[500px] truncate font-medium" },
          row.getValue("title")
        ),
      ]);
    },
  },
  {
    accessorKey: "createdAt",
    header: () => h("div", { class: "text-left" }, "Countdown"),
    cell: ({ row }) => {
      return h("div", { class: "flex space-x-2" }, [
        h(CountDown, {
          createdAt:
            row.getValue<AllNotesResult["notes"][number]["createdAt"]>(
              "createdAt"
            ),
          interval: 100,
        }),
      ]);
    },
  },
];
