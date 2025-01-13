<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast/use-toast";

import { db } from "@/db";

const { toast } = useToast();

const { user, isLoading: isLoadingAuth, error } = db.useAuth();

const email = ref("");
const sentEmail = ref("");
const code = ref("");
const isLoading = ref(false);

const defaultError = "Unknown error";

watchEffect(() => {
  if (!error.value) {
    return;
  }
  toast({
    description: error.value.message || defaultError,
    variant: "destructive",
  });
});

watchEffect(() => {
  if (user.value) {
    email.value = "";
    sentEmail.value = "";
    code.value = "";
    isLoading.value = false;
  }
});

async function sendCode() {
  if (!email.value) {
    toast({
      description: "Please enter an email",
      variant: "destructive",
    });
    return;
  }

  isLoading.value = true;
  sentEmail.value = email.value;
  try {
    await db.auth.sendMagicCode({ email: email.value });
    sentEmail.value = email.value;
  } catch (error) {
    toast({
      description: (error as any).body?.message || defaultError,
      variant: "destructive",
    });
    sentEmail.value = "";
  }
  isLoading.value = false;
}

async function verify() {
  if (!code.value) {
    toast({
      description: "Please enter the code",
      variant: "destructive",
    });
    return;
  }

  isLoading.value = true;
  try {
    await db.auth.signInWithMagicCode({
      email: sentEmail.value,
      code: code.value,
    });
  } catch (error) {
    toast({
      description: (error as any).body?.message || defaultError,
      variant: "destructive",
    });
    code.value = "";
  }
  isLoading.value = false;
}
</script>

<template>
  <Card v-if="user" class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl"> Account </CardTitle>
      <CardDescription>
        You are registered with the email {{ user.email }}
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
  <Card v-else-if="sentEmail" class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl"> Login </CardTitle>
      <CardDescription>
        Okay we sent you an email! What was the code?
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="grid gap-2">
        <Label for="code">Code</Label>
        <Input
          id="code"
          type="text"
          required
          v-model="code"
          :disabled="isLoading"
        />
      </div>
    </CardContent>
    <CardFooter>
      <Button class="w-full" @click="verify" :disabled="isLoading">
        Verify
      </Button>
    </CardFooter>
  </Card>
  <Card v-else class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl"> Login </CardTitle>
      <CardDescription>
        You can create public notes without login. With an account your notes
        are private. Your account will be deleted after 1 hour</CardDescription
      >
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="grid gap-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          v-model="email"
          :disabled="isLoading"
        />
      </div>
    </CardContent>
    <CardFooter>
      <Button class="w-full" @click="sendCode" :disabled="isLoading">
        Send Code
      </Button>
    </CardFooter>
  </Card>
</template>
