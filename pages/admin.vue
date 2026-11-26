<script setup lang="ts">
import {
  AlertCircle,
  Download,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-vue-next";
import civiLinkLogo from "~/assets/images/CiviLinkSA-Logo.png";
import type { AdminFeedbackResponse, FeedbackSubmissionItem } from "~/utils/admin-types";
import { buildCsvDocument } from "~/utils/csv";
import { feedbackDepartments } from "~/utils/feedback-schema";

definePageMeta({
  layout: false,
});

useHead({
  title: "Survey Insights | CiviLink SA",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const requestHeaders = useRequestHeaders(["cookie"]);
const { data: sessionData, refresh: refreshSession } = await useFetch<{ authenticated: boolean }>(
  "/api/admin/session",
  {
    headers: requestHeaders,
    default: () => ({ authenticated: false }),
  },
);

const isAuthenticated = computed(() => Boolean(sessionData.value?.authenticated));

const password = ref("");
const authError = ref("");
const isLoggingIn = ref(false);

const feedbackData = ref<AdminFeedbackResponse | null>(null);
const loadError = ref("");
const isLoadingFeedback = ref(false);

const selectedDepartment = ref("");
const queueFilter = ref<"all" | "yes" | "no">("all");
const onlineFilter = ref<"all" | "yes" | "maybe" | "no">("all");
const searchQuery = ref("");
const showContacts = ref(false);

async function loadFeedback() {
  if (!isAuthenticated.value) return;
  isLoadingFeedback.value = true;
  loadError.value = "";
  try {
    feedbackData.value = await $fetch<AdminFeedbackResponse>("/api/admin/feedback");
  } catch (error: unknown) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;
    if (statusCode === 401) {
      await refreshSession();
      feedbackData.value = null;
    } else {
      loadError.value = "Could not load feedback submissions. Check your Supabase connection.";
    }
  } finally {
    isLoadingFeedback.value = false;
  }
}

watch(
  isAuthenticated,
  (authed: boolean) => {
    if (authed && import.meta.client) {
      loadFeedback();
    }
  },
  { immediate: true },
);

async function handleLogin() {
  authError.value = "";
  isLoggingIn.value = true;
  try {
    await $fetch("/api/admin/login", {
      method: "POST",
      body: { password: password.value },
    });
    password.value = "";
    await refreshSession();
    await loadFeedback();
  } catch (error: unknown) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;
    if (statusCode === 429) {
      authError.value = "Too many failed attempts. Please wait 15 minutes before trying again.";
    } else if (statusCode === 503) {
      authError.value = "ADMIN_PASSWORD is not configured in the server environment (.env).";
    } else {
      authError.value = "Incorrect password.";
    }
  } finally {
    isLoggingIn.value = false;
  }
}

async function handleLogout() {
  await $fetch("/api/admin/logout", { method: "POST" });
  feedbackData.value = null;
  await refreshSession();
}

const filteredItems = computed<FeedbackSubmissionItem[]>(() => {
  const items = feedbackData.value?.items ?? [];
  const query = searchQuery.value.trim().toLowerCase();

  return items.filter((item) => {
    if (selectedDepartment.value && item.department !== selectedDepartment.value) return false;
    if (queueFilter.value === "yes" && !item.experienced_long_queues) return false;
    if (queueFilter.value === "no" && item.experienced_long_queues) return false;
    if (onlineFilter.value !== "all" && item.would_use_online_platform !== onlineFilter.value) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      item.department,
      item.department_other ?? "",
      item.challenges,
      item.services_wanted_online,
      item.additional_suggestions ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
});

const queueRate = computed(() => {
  const summary = feedbackData.value?.summary;
  if (!summary || summary.total === 0) return "0%";
  return `${Math.round((summary.longQueues.yes / summary.total) * 100)}%`;
});

const onlineDemandRate = computed(() => {
  const summary = feedbackData.value?.summary;
  if (!summary || summary.total === 0) return "0%";
  const positive = summary.onlineInterest.yes + summary.onlineInterest.maybe;
  return `${Math.round((positive / summary.total) * 100)}%`;
});

const topDepartment = computed(() => {
  const top = feedbackData.value?.summary.byDepartment[0];
  if (!top || top.count === 0) return "No responses yet";
  return `${top.department} (${top.count})`;
});

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function exportCsv() {
  const rows = filteredItems.value.map((item) => [
    item.created_at,
    item.department,
    item.department_other ?? "",
    item.experienced_long_queues ? "Yes" : "No",
    item.would_use_online_platform,
    item.challenges,
    item.services_wanted_online,
    item.additional_suggestions ?? "",
    showContacts.value ? (item.full_name ?? "") : "",
    showContacts.value ? (item.email ?? "") : "",
  ]);

  const csv = buildCsvDocument(
    [
      "Submitted At",
      "Department",
      "Department Other",
      "Experienced Long Queues",
      "Would Use Online Platform",
      "Challenges",
      "Services Wanted Online",
      "Additional Suggestions",
      "Full Name",
      "Email",
    ],
    rows,
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `civilink-sa-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="min-h-screen bg-civic-soft/50 text-foreground">
    <div v-if="!isAuthenticated" class="flex min-h-screen items-center justify-center px-4 py-12">
      <div class="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        <div class="flex items-center justify-between gap-4">
          <img
            :src="civiLinkLogo"
            alt="CiviLink SA"
            class="h-10 w-36 object-contain object-left"
          />
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-civic-soft px-3 py-1 text-xs font-medium text-primary"
          >
            <Lock class="size-3.5" aria-hidden="true" />
            Private
          </span>
        </div>

        <h1 class="mt-6 font-display text-2xl font-semibold text-primary">
          Survey Insights Access
        </h1>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">
          Enter your admin password to view aggregated survey charts and submitted responses.
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
          <div
            v-if="authError"
            role="alert"
            class="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground"
          >
            <AlertCircle class="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <span>{{ authError }}</span>
          </div>

          <div>
            <Label for="admin-password">Admin password</Label>
            <Input
              id="admin-password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-2 h-11 bg-background"
              placeholder="Enter admin password"
            />
          </div>

          <Button type="submit" variant="civic" size="lg" class="w-full" :disabled="isLoggingIn">
            {{ isLoggingIn ? "Verifying…" : "Unlock Insights" }}
          </Button>
        </form>

        <div class="mt-6 border-t border-border pt-4 text-center">
          <NuxtLink
            to="/"
            class="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Return to public survey
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else>
      <header class="border-b border-border bg-background">
        <div
          class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8"
        >
          <div class="flex items-center gap-4">
            <NuxtLink to="/" aria-label="CiviLink SA home">
              <img
                :src="civiLinkLogo"
                alt="CiviLink SA"
                class="h-10 w-36 object-contain object-left"
              />
            </NuxtLink>
            <span class="hidden h-5 w-px bg-border sm:inline-block" aria-hidden="true" />
            <span class="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <ShieldCheck class="size-4 text-civic-green-deep" aria-hidden="true" />
              Survey Insights
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" :disabled="isLoadingFeedback" @click="loadFeedback">
              <RefreshCw :class="isLoadingFeedback ? 'animate-spin' : ''" aria-hidden="true" />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="filteredItems.length === 0"
              @click="exportCsv"
            >
              <Download aria-hidden="true" />
              <span>Export CSV</span>
            </Button>
            <Button variant="ghost" size="sm" @click="handleLogout">
              <LogOut aria-hidden="true" />
              <span>Lock</span>
            </Button>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
        <div
          v-if="loadError"
          role="alert"
          class="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <AlertCircle class="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <span>{{ loadError }}</span>
        </div>

        <section v-if="feedbackData" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border border-border bg-card p-5">
            <p class="text-xs font-medium text-muted-foreground">Total Submissions</p>
            <p class="mt-2 font-display text-3xl font-bold text-primary">
              {{ feedbackData.summary.total }}
            </p>
          </div>
          <div class="rounded-lg border border-border bg-card p-5">
            <p class="text-xs font-medium text-muted-foreground">Reported Long Queues</p>
            <p class="mt-2 font-display text-3xl font-bold text-primary">{{ queueRate }}</p>
          </div>
          <div class="rounded-lg border border-border bg-card p-5">
            <p class="text-xs font-medium text-muted-foreground">Open to Online Portal</p>
            <p class="mt-2 font-display text-3xl font-bold text-civic-green-deep">
              {{ onlineDemandRate }}
            </p>
          </div>
          <div class="rounded-lg border border-border bg-card p-5">
            <p class="text-xs font-medium text-muted-foreground">Most Mentioned Service</p>
            <p class="mt-2 text-lg font-semibold text-primary">{{ topDepartment }}</p>
          </div>
        </section>

        <ClientOnly v-if="feedbackData">
          <section class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div class="rounded-lg border border-border bg-card p-5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 class="text-sm font-semibold text-primary">
                    Responses by Service / Department
                  </h2>
                  <p class="mt-1 text-xs text-muted-foreground">
                    Click any bar to filter written responses below
                  </p>
                </div>
                <Button
                  v-if="selectedDepartment"
                  variant="ghost"
                  size="sm"
                  @click="selectedDepartment = ''"
                >
                  Clear: {{ selectedDepartment }}
                </Button>
              </div>
              <div class="mt-4">
                <DepartmentChart
                  :data="feedbackData.summary.byDepartment"
                  :selected-department="selectedDepartment"
                  @select-department="selectedDepartment = $event"
                />
              </div>
            </div>

            <ResponseBreakdownCharts :summary="feedbackData.summary" />
          </section>
        </ClientOnly>

        <section v-if="feedbackData" class="rounded-lg border border-border bg-card p-5 sm:p-6">
          <div
            class="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <h2 class="text-lg font-semibold text-primary">
                Written Responses ({{ filteredItems.length }})
              </h2>
              <p class="mt-1 text-xs text-muted-foreground">
                Read what respondents shared about challenges and requested online services.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
              <div class="relative">
                <Search
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Search responses..."
                  class="h-9 bg-background pl-9 sm:w-56"
                />
              </div>

              <select
                v-model="selectedDepartment"
                aria-label="Filter by department"
                class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All departments</option>
                <option v-for="dept in feedbackDepartments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>

              <select
                v-model="queueFilter"
                aria-label="Filter by queue experience"
                class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Queues: All</option>
                <option value="yes">Queues: Yes</option>
                <option value="no">Queues: No</option>
              </select>

              <select
                v-model="onlineFilter"
                aria-label="Filter by online platform interest"
                class="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Online interest: All</option>
                <option value="yes">Online: Yes</option>
                <option value="maybe">Online: Maybe</option>
                <option value="no">Online: No</option>
              </select>

              <Button variant="outline" size="sm" @click="showContacts = !showContacts">
                <EyeOff v-if="showContacts" aria-hidden="true" />
                <Eye v-else aria-hidden="true" />
                <span>{{ showContacts ? "Hide contacts" : "Show contacts" }}</span>
              </Button>
            </div>
          </div>

          <div
            v-if="filteredItems.length === 0"
            class="py-12 text-center text-sm text-muted-foreground"
          >
            No feedback responses match the current filters.
          </div>

          <div v-else class="mt-5 space-y-4">
            <article
              v-for="item in filteredItems"
              :key="item.id"
              class="rounded-md border border-border bg-background p-4 sm:p-5"
            >
              <div
                class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="rounded bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
                  >
                    {{
                      item.department === "Other" && item.department_other
                        ? `Other: ${item.department_other}`
                        : item.department
                    }}
                  </span>
                  <span
                    class="rounded border border-border bg-civic-soft px-2 py-0.5 text-xs text-foreground"
                  >
                    Long queues: {{ item.experienced_long_queues ? "Yes" : "No" }}
                  </span>
                  <span
                    class="rounded border border-border bg-civic-soft px-2 py-0.5 text-xs capitalize text-foreground"
                  >
                    Online portal: {{ item.would_use_online_platform }}
                  </span>
                </div>
                <time :datetime="item.created_at" class="text-xs text-muted-foreground">
                  {{ formatDate(item.created_at) }}
                </time>
              </div>

              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Challenges Experienced
                  </p>
                  <p class="mt-1 whitespace-pre-line text-sm leading-6 text-foreground">
                    {{ item.challenges }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Services Wanted Online
                  </p>
                  <p class="mt-1 whitespace-pre-line text-sm leading-6 text-foreground">
                    {{ item.services_wanted_online }}
                  </p>
                </div>
              </div>

              <div v-if="item.additional_suggestions" class="mt-4 border-t border-border pt-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Additional Suggestions
                </p>
                <p class="mt-1 whitespace-pre-line text-sm leading-6 text-foreground">
                  {{ item.additional_suggestions }}
                </p>
              </div>

              <div
                v-if="showContacts && (item.full_name || item.email)"
                class="mt-3 border-t border-border pt-3 text-xs text-muted-foreground"
              >
                <span v-if="item.full_name">Name: {{ item.full_name }}</span>
                <span v-if="item.full_name && item.email"> · </span>
                <span v-if="item.email">Email: {{ item.email }}</span>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
