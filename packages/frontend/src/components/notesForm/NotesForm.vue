<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useForm, useSubmitForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import { db, id } from "@/db";

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

const formRef = useTemplateRef<HTMLFormElement>("form");

const formSchema = toTypedSchema(
  z.object({
    title: z
      .string()
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
    await db.transact(db.tx.notes[id()].update({ title: values.title }));
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
  console.log(event.key, event.shiftKey);
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
          This note will be automatically deleted after one minute
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit"> Add </Button>
  </form>
</template>
