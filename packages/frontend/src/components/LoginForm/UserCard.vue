<script setup lang="ts">
import { computed } from "vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { db } from "@/db";

import { expiresAfter } from "instant";

const { user, isLoading } = db.useAuth();
const { data } = db.useQuery({ $users: { account: {} } });
const expirationText = computed(() => {
  const createdAt = data.value?.$users[0].account?.createdAt;
  if (createdAt) {
    const date = new Date(createdAt + expiresAfter.accounts);
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(date);
  }
  return `${expiresAfter.accounts / 1000 / 60} minutes`;
});
</script>

<template>
  <Card
    class="flex flex-col justify-between w-full max-w-sm"
    :class="{ 'motion-safe:animate-pulse': isLoading }"
  >
    <CardHeader>
      <CardTitle class="text-2xl"> Account </CardTitle>
      <CardDescription>
        You are registered with the email {{ user?.email }}
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <p>
        Your notes will be private. Your account will be deleted after
        {{ expirationText }}.
      </p>
    </CardContent>
    <CardFooter>
      <Button class="w-full" @click="db.auth.signOut()" :disabled="isLoading">
        Log out
      </Button>
    </CardFooter>
  </Card>
</template>
