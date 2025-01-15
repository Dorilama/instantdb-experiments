<script setup lang="ts">
import { useForm, useSubmitForm } from "vee-validate";
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

import { db, id } from "@/db";
import { expiresAfter } from "instant";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const { user } = db.useAuth();

const formSchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .trim()
      .min(1, {
        message: "Note must be at least 1 character.",
      })
      .max(150, {
        message: "Note must not be longer than 150 characters.",
      })
      .optional(),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const submit: Parameters<typeof handleSubmit>[0] = async (values, actions) => {
  if (!values.title) {
    actions.setFieldError("title", "Required");
    return;
  }
  try {
    await db.transact(
      db.tx.notes[id()]
        .update({
          title: values.title,
        })
        .link({ owner: user.value?.id })
    );
    actions.resetForm();
  } catch (error) {
    const defaultMessage = "Unknown error";
    let message = defaultMessage;
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    actions.setErrors({ title: message || defaultMessage });
  }
};

const onSubmit = handleSubmit(submit);
const manualSubmit = useSubmitForm(submit);

function submitOnShiftEnter(event: KeyboardEvent) {
  if (event.key === "Enter" && event.shiftKey) {
    event.preventDefault();
    manualSubmit();
  }
}
</script>

<template>
  <Card class="flex flex-col justify-between">
    <CardHeader>
      <CardTitle class="text-2xl"> Create note </CardTitle>
      <CardDescription
        >The server will automatically delete this note after
        {{ expiresAfter.notes / 1000 }} seconds.<br />
        It will also redact the text "hello".</CardDescription
      >
    </CardHeader>
    <CardContent class="grid gap-4">
      <form @submit="onSubmit" id="create-note">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel class="sr-only">Note</FormLabel>
            <FormControl>
              <Textarea
                type="text"
                placeholder="write your note"
                v-bind="componentField"
                @keydown="submitOnShiftEnter"
                class="min-h-10"
              ></Textarea>
            </FormControl>
            <!-- <FormDescription>
              The server will automatically delete this note after
              {{ expiresAfter.notes / 1000 }} seconds.<br />
              It will also redact the text "hello"
            </FormDescription> -->
            <FormMessage />
          </FormItem>
        </FormField>
      </form>
    </CardContent>
    <CardFooter>
      <Button type="submit" form="create-note" class="w-full"> Add </Button>
    </CardFooter>
  </Card>
</template>
