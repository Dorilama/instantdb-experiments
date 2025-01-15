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
import { Loader2 } from "lucide-vue-next";

import { db } from "@/db";

const props = defineProps<{ email: string | undefined }>();

const id = useId();

const { isLoading } = db.useAuth();

const defaultError = "Unknown error";

const formSchema = toTypedSchema(
  z.object({
    code: z.string().trim().optional(),
  })
);

const { handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const onEmailSubmit = handleSubmit(async ({ code }, actions) => {
  if (!code) {
    actions.setFieldError("code", "Required");
    return;
  }
  if (!props.email) {
    actions.setFieldError("code", "Missing email from first step");
    return;
  }
  try {
    try {
      await db.auth.signInWithMagicCode({
        email: props.email,
        code,
      });
    } catch (error) {
      actions.setFieldError(
        "code",
        (error as any).body?.message || defaultError
      );
    }
  } catch (error) {
    actions.setFieldError("code", (error as any).body?.message || defaultError);
  }
});

defineExpose({ resetForm });
</script>

<template>
  <Card
    class="flex flex-col justify-between w-full max-w-sm"
    :class="{ 'motion-safe:animate-pulse': isLoading }"
  >
    <CardHeader>
      <CardTitle class="text-2xl"> Login </CardTitle>
      <CardDescription>
        Okay we sent you an email! What was the code?</CardDescription
      >
    </CardHeader>
    <CardContent class="grid gap-4">
      <form @submit="onEmailSubmit" :id="id">
        <FormField v-slot="{ componentField }" name="code">
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input
                type="code"
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
      <Button
        type="submit"
        :form="id"
        class="w-full"
        :disabled="isLoading || isSubmitting"
      >
        Verify
        <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
      </Button>
    </CardFooter>
  </Card>
</template>
