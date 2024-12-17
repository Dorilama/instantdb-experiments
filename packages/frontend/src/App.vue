<script setup lang="ts">
import { allNotesQuery } from "@/components/notesTable/db";
import { columns } from "@/components/notesTable/columns";
import DataTable from "@/components/notesTable/DataTable.vue";
import { db } from "@/db";

const { data } = db.useQuery(allNotesQuery);
</script>

<template>
  <div class="container py-10 mx-auto">
    <DataTable :columns="columns" :data="data?.notes || []" />
  </div>
</template>
