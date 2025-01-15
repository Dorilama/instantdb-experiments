<script setup lang="ts">
import { useId } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { db } from "@/db";

import { sentEmail, lastEmail, error } from "./store";
import { expiresAfter } from "instant";

const id = useId();

const { isLoading } = db.useAuth();

const defaultError = "Unknown error";

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email({ message: "Invalid email address" }).optional(),
  })
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: { email: lastEmail.value },
  initialErrors: { email: error.value },
});

const onEmailSubmit = handleSubmit(async ({ email }, actions) => {
  if (!email) {
    actions.setFieldError("email", "Required");
    return;
  }
  error.value = "";
  lastEmail.value = email;
  sentEmail.value = email;
  try {
    await db.auth.sendMagicCode({ email });
  } catch (err) {
    error.value = (err as any).body?.message || defaultError;
    sentEmail.value = "";
  }
});

defineExpose({ resetForm });
</script>

<template>
  <Card
    class="flex flex-col justify-between"
    :class="{ 'motion-safe:animate-pulse': isLoading }"
  >
    <CardHeader>
      <CardTitle class="text-2xl"> Login </CardTitle>
      <CardDescription>
        You can create public notes without login. With an account your notes
        are private. Your account will be deleted after
        {{ expiresAfter.accounts / 1000 / 60 }} minutes.</CardDescription
      >
    </CardHeader>
    <CardContent class="grid gap-4">
      <form @submit="onEmailSubmit" :id="id">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder=""
                v-bind="componentField"
                class="min-h-10"
              ></Input>
            </FormControl>
            <!-- <FormDescription>
            </FormDescription> -->
            <FormMessage />
          </FormItem>
        </FormField>
      </form>
    </CardContent>
    <CardFooter>
      <Button type="submit" :form="id" class="w-full" :disabled="isLoading">
        Send code
      </Button>
    </CardFooter>
  </Card>
</template>
