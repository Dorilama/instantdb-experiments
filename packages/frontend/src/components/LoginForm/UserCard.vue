<script setup lang="ts">
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

const { user, isLoading } = db.useAuth();
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
        Your notes will be private. Your account will be deleted after 1 hour.
      </p>
    </CardContent>
    <CardFooter>
      <Button class="w-full" @click="db.auth.signOut()" :disabled="isLoading">
        Log out
      </Button>
    </CardFooter>
  </Card>
</template>
