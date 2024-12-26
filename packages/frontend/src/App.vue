<script setup lang="ts">
import { columns } from "@/components/notesTable/columns";
import DataTable from "@/components/notesTable/DataTable.vue";
import NotesForm from "./components/notesForm/NotesForm.vue";
import { db } from "@/db";

const { data } = db.useQuery({ notes: { $: { limit: 25 } } });
</script>

<template>
  <div class="flex flex-wrap gap-12 container py-10 mx-auto">
    <NotesForm class="flex flex-col gap-1 flex-auto" />
    <DataTable :columns="columns" :data="data?.notes || []" class="flex-auto" />
  </div>
</template>
