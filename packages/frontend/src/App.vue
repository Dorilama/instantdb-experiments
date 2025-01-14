<script setup lang="ts">
import { columns } from "@/components/notesTable/columns";
import DataTable from "@/components/notesTable/DataTable.vue";
import NotesForm from "./components/notesForm/NotesForm.vue";
import Toaster from "@/components/ui/toast/Toaster.vue";
import LoginForm from "@/components/LoginForm/LoginForm.vue";

import { db } from "@/db";

const { data } = db.useQuery({ notes: { $: { limit: 25 } } });
</script>

<template>
  <div class="flex flex-col gap-12 container py-10 mx-auto max-w-screen-lg">
    <div class="flex flex-wrap items-stretch justify-between gap-12">
      <LoginForm class="grow" style="flex-basis: calc((40rem - 100%) * 999)" />
      <NotesForm
        class="grow flex flex-col gap-1"
        style="flex-basis: calc((40rem - 100%) * 999)"
      />
    </div>

    <DataTable :columns="columns" :data="data?.notes || []" class="flex-auto" />
  </div>
  <Toaster />
</template>
