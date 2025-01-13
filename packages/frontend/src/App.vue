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
  <div class="flex flex-col gap-12 container py-10 mx-auto">
    <div class="flex flex-wrap items-end gap-12">
      <LoginForm />
      <NotesForm class="flex flex-col gap-1" />
    </div>

    <DataTable :columns="columns" :data="data?.notes || []" class="flex-auto" />
  </div>
  <Toaster />
</template>
