<script setup lang="ts">
import { watchEffect, useTemplateRef } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { db } from "@/db";
import EmailForm from "./EmailForm.vue";
import CodeForm from "./CodeForm.vue";
import UserCard from "./UserCard.vue";
import { sentEmail } from "./store";

const { toast } = useToast();

const { user, isLoading, error } = db.useAuth();

const defaultError = "Unknown error";

const emailRef = useTemplateRef<InstanceType<typeof EmailForm>>("email");
const codeRef = useTemplateRef<InstanceType<typeof CodeForm>>("code");

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
    emailRef.value?.resetForm();
    codeRef.value?.resetForm();
  }
});
</script>

<template>
  <UserCard v-if="user"></UserCard>
  <CodeForm v-else-if="sentEmail" ref="code" :email="sentEmail"> </CodeForm>
  <EmailForm v-else ref="email"></EmailForm>
</template>
