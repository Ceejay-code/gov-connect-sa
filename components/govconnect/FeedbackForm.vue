<script setup lang="ts">
import { AlertCircle, CheckCircle2, Loader2, Lock, Send } from "lucide-vue-next";
import { feedbackDepartments, feedbackSchema, type FeedbackValues } from "~/utils/feedback-schema";

const createInitialValues = (): FeedbackValues => ({
  fullName: "",
  email: "",
  department: "",
  departmentOther: "",
  experiencedLongQueues: "",
  challenges: "",
  servicesWantedOnline: "",
  wouldUseOnlinePlatform: "",
  additionalSuggestions: "",
});

const values = reactive<FeedbackValues>(createInitialValues());
const errors = ref<Record<string, string>>({});
const status = ref<"idle" | "submitting">("idle");
const notice = ref<{ type: "success" | "error"; text: string } | null>(null);

const { submitFeedback } = useFeedbackSubmission();

const isSubmitting = computed(() => status.value === "submitting");
const hasErrors = computed(() => Object.keys(errors.value).length > 0);

function updateValue(field: keyof FeedbackValues, value: string) {
  values[field] = value;
  if (field === "department" && value !== "Other") {
    values.departmentOther = "";
  }

  const nextErrors = { ...errors.value };
  delete nextErrors[field];
  if (field === "department" && value !== "Other") {
    delete nextErrors.departmentOther;
  }
  errors.value = nextErrors;
  notice.value = null;
}

async function handleSubmit() {
  const result = feedbackSchema.safeParse(values);

  if (!result.success) {
    const nextErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !nextErrors[field]) {
        nextErrors[field] = issue.message;
      }
    }
    errors.value = nextErrors;
    notice.value = { type: "error", text: "Please check the highlighted fields." };
    return;
  }

  errors.value = {};
  notice.value = null;
  status.value = "submitting";

  try {
    await submitFeedback({ ...values });
    Object.assign(values, createInitialValues());
    notice.value = {
      type: "success",
      text: "Thank you. Your feedback has been saved and will help guide the initiative.",
    };
  } catch {
    notice.value = {
      type: "error",
      text: "We could not save your feedback just now. Please try again.",
    };
  } finally {
    status.value = "idle";
  }
}
</script>

<template>
  <form
    class="rounded-lg border border-border bg-card p-5 sm:p-7 lg:p-8"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <Transition name="fade-slide">
      <div
        v-if="notice"
        :class="[
          'mb-6 flex items-start gap-3 rounded-md border p-4',
          notice.type === 'success'
            ? 'border-civic-green/30 bg-civic-soft text-foreground'
            : 'border-destructive/30 bg-destructive/5 text-foreground',
        ]"
        :role="notice.type === 'success' ? 'status' : 'alert'"
        aria-live="polite"
      >
        <CheckCircle2
          v-if="notice.type === 'success'"
          class="mt-0.5 size-4 shrink-0 text-civic-green-deep"
          aria-hidden="true"
        />
        <AlertCircle v-else class="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        <p class="text-sm leading-6">{{ notice.text }}</p>
      </div>
    </Transition>

    <p v-if="hasErrors" class="sr-only" role="alert">
      Please review the highlighted fields before submitting.
    </p>

    <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2">
      <div>
        <Label for="feedback-fullName">
          Full name <span class="font-normal text-muted-foreground">Optional</span>
        </Label>
        <Input
          id="feedback-fullName"
          autocomplete="name"
          maxlength="100"
          :model-value="values.fullName"
          :aria-invalid="Boolean(errors.fullName)"
          :aria-describedby="errors.fullName ? 'feedback-fullName-error' : undefined"
          :class="['mt-2 h-11 bg-background', errors.fullName ? 'border-destructive' : '']"
          @update:model-value="updateValue('fullName', $event)"
        />
        <FieldError id="feedback-fullName-error" :message="errors.fullName" />
      </div>

      <div>
        <Label for="feedback-email">
          Email address <span class="font-normal text-muted-foreground">Optional</span>
        </Label>
        <Input
          id="feedback-email"
          type="email"
          autocomplete="email"
          maxlength="255"
          :model-value="values.email"
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? 'feedback-email-error' : undefined"
          :class="['mt-2 h-11 bg-background', errors.email ? 'border-destructive' : '']"
          @update:model-value="updateValue('email', $event)"
        />
        <FieldError id="feedback-email-error" :message="errors.email" />
      </div>

      <div class="sm:col-span-2">
        <Label for="feedback-department">
          Which service or department have you interacted with?
        </Label>
        <select
          id="feedback-department"
          :value="values.department"
          :aria-invalid="Boolean(errors.department)"
          :aria-describedby="errors.department ? 'feedback-department-error' : undefined"
          :class="[
            'mt-2 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            errors.department ? 'border-destructive' : '',
          ]"
          @change="updateValue('department', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Select a service or department</option>
          <option v-for="department in feedbackDepartments" :key="department" :value="department">
            {{ department }}
          </option>
        </select>
        <FieldError id="feedback-department-error" :message="errors.department" />
      </div>

      <Transition name="fade-slide">
        <div v-if="values.department === 'Other'" class="sm:col-span-2">
          <Label for="feedback-departmentOther">Which service or department?</Label>
          <Input
            id="feedback-departmentOther"
            maxlength="100"
            :model-value="values.departmentOther"
            :aria-invalid="Boolean(errors.departmentOther)"
            :aria-describedby="
              errors.departmentOther ? 'feedback-departmentOther-error' : undefined
            "
            :class="['mt-2 h-11 bg-background', errors.departmentOther ? 'border-destructive' : '']"
            @update:model-value="updateValue('departmentOther', $event)"
          />
          <FieldError id="feedback-departmentOther-error" :message="errors.departmentOther" />
        </div>
      </Transition>

      <div class="sm:col-span-2">
        <ChoiceField
          name="feedback-experiencedLongQueues"
          label="Have you experienced long queues at government offices?"
          :model-value="values.experiencedLongQueues"
          :options="[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ]"
          :error="errors.experiencedLongQueues"
          @update:model-value="updateValue('experiencedLongQueues', $event)"
        />
      </div>

      <div class="sm:col-span-2">
        <Label for="feedback-challenges">What challenges have you experienced?</Label>
        <Textarea
          id="feedback-challenges"
          maxlength="2000"
          rows="4"
          :model-value="values.challenges"
          :aria-invalid="Boolean(errors.challenges)"
          :aria-describedby="errors.challenges ? 'feedback-challenges-error' : undefined"
          :class="[
            'mt-2 min-h-28 resize-y bg-background',
            errors.challenges ? 'border-destructive' : '',
          ]"
          @update:model-value="updateValue('challenges', $event)"
        />
        <FieldError id="feedback-challenges-error" :message="errors.challenges" />
      </div>

      <div class="sm:col-span-2">
        <Label for="feedback-servicesWantedOnline">
          Which government services would you like to access online?
        </Label>
        <Textarea
          id="feedback-servicesWantedOnline"
          maxlength="2000"
          rows="4"
          :model-value="values.servicesWantedOnline"
          :aria-invalid="Boolean(errors.servicesWantedOnline)"
          :aria-describedby="
            errors.servicesWantedOnline ? 'feedback-servicesWantedOnline-error' : undefined
          "
          :class="[
            'mt-2 min-h-28 resize-y bg-background',
            errors.servicesWantedOnline ? 'border-destructive' : '',
          ]"
          @update:model-value="updateValue('servicesWantedOnline', $event)"
        />
        <FieldError
          id="feedback-servicesWantedOnline-error"
          :message="errors.servicesWantedOnline"
        />
      </div>

      <div class="sm:col-span-2">
        <ChoiceField
          name="feedback-wouldUseOnlinePlatform"
          label="Would you use a platform to submit requests and track progress online?"
          :model-value="values.wouldUseOnlinePlatform"
          :options="[
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'Maybe', value: 'maybe' },
          ]"
          :error="errors.wouldUseOnlinePlatform"
          @update:model-value="updateValue('wouldUseOnlinePlatform', $event)"
        />
      </div>

      <div class="sm:col-span-2">
        <Label for="feedback-additionalSuggestions">
          Additional suggestions <span class="font-normal text-muted-foreground">Optional</span>
        </Label>
        <Textarea
          id="feedback-additionalSuggestions"
          maxlength="2000"
          rows="3"
          :model-value="values.additionalSuggestions"
          :aria-invalid="Boolean(errors.additionalSuggestions)"
          :aria-describedby="
            errors.additionalSuggestions ? 'feedback-additionalSuggestions-error' : undefined
          "
          :class="[
            'mt-2 min-h-24 resize-y bg-background',
            errors.additionalSuggestions ? 'border-destructive' : '',
          ]"
          @update:model-value="updateValue('additionalSuggestions', $event)"
        />
        <FieldError
          id="feedback-additionalSuggestions-error"
          :message="errors.additionalSuggestions"
        />
      </div>
    </div>

    <div
      class="mt-7 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="flex max-w-md items-start gap-2 text-xs leading-5 text-muted-foreground">
        <Lock class="mt-0.5 size-3.5 shrink-0 text-civic-green-deep" aria-hidden="true" />
        <span>
          Your name and email are optional. Please do not include ID numbers, passwords, or other
          sensitive details.
        </span>
      </p>
      <Button type="submit" variant="civic" size="lg" :disabled="isSubmitting" class="shrink-0">
        <Loader2 v-if="isSubmitting" class="animate-spin" aria-hidden="true" />
        <Send v-else aria-hidden="true" />
        <span>{{ isSubmitting ? "Sending…" : "Submit feedback" }}</span>
      </Button>
    </div>
  </form>
</template>
