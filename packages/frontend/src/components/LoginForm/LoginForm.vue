<script setup lang="ts">
import { watchEffect, useTemplateRef } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { db } from "@/db";
import EmailForm from "./EmailForm.vue";
import CodeForm from "./CodeForm.vue";
import UserCard from "./UserCard.vue";
import { sentEmail, error, lastEmail } from "./store";

const { toast } = useToast();

const { user, isLoading, error: authError } = db.useAuth();

const defaultError = "Unknown error";

const emailRef = useTemplateRef<InstanceType<typeof EmailForm>>("email");
const codeRef = useTemplateRef<InstanceType<typeof CodeForm>>("code");

watchEffect(() => {
  if (!authError.value) {
    return;
  }
  toast({
    description: authError.value.message || defaultError,
    variant: "destructive",
  });
});

watchEffect(() => {
  if (user.value) {
    emailRef.value?.resetForm();
    codeRef.value?.resetForm();
    error.value = "";
    sentEmail.value = "";
    lastEmail.value = "";
  }
});
</script>

<template>
  <UserCard v-if="user"></UserCard>
  <CodeForm v-else-if="sentEmail" ref="code" :email="sentEmail"> </CodeForm>
  <EmailForm v-else ref="email"></EmailForm>
</template>
