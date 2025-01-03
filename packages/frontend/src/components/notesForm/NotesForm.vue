<script setup lang="ts">
import { useForm, useSubmitForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

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
      }),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const submit: Parameters<typeof handleSubmit>[0] = async (values, actions) => {
  try {
    await db.transact(
      db.tx.notes[id()].update({
        title: values.title,
      })
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
  <form @submit="onSubmit" ref="form">
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel class="sr-only">Note</FormLabel>
        <FormControl>
          <Textarea
            type="text"
            placeholder="write your note"
            v-bind="componentField"
            @keydown="submitOnShiftEnter"
          ></Textarea>
        </FormControl>
        <FormDescription>
          The server will automatically delete this note after
          {{ expiresAfter / 1000 }} seconds.<br />
          It will also redact the text "hello"
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit"> Add </Button>
  </form>
</template>
