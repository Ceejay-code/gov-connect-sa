<script setup lang="ts">
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "vue-chartjs";
import type { FeedbackSummary } from "~/utils/admin-types";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  summary: FeedbackSummary;
}>();

const queueChartData = computed(() => ({
  labels: ["Experienced long queues", "No long queues"],
  datasets: [
    {
      data: [props.summary.longQueues.yes, props.summary.longQueues.no],
      backgroundColor: ["#1b365d", "#cbd5e1"],
      borderWidth: 0,
    },
  ],
}));

const onlineChartData = computed(() => ({
  labels: ["Yes", "Maybe", "No"],
  datasets: [
    {
      data: [
        props.summary.onlineInterest.yes,
        props.summary.onlineInterest.maybe,
        props.summary.onlineInterest.no,
      ],
      backgroundColor: ["#1d7a4c", "#e5a93c", "#cbd5e1"],
      borderWidth: 0,
    },
  ],
}));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "64%",
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        padding: 16,
        color: "#334155",
      },
    },
  },
};
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <div class="rounded-lg border border-border bg-card p-5">
      <h3 class="text-sm font-semibold text-primary">Long Queues Experienced</h3>
      <p class="mt-1 text-xs text-muted-foreground">Share of respondents facing queues</p>
      <div class="mt-4 h-52">
        <Doughnut :data="queueChartData" :options="doughnutOptions" />
      </div>
    </div>

    <div class="rounded-lg border border-border bg-card p-5">
      <h3 class="text-sm font-semibold text-primary">Would Use Online Platform</h3>
      <p class="mt-1 text-xs text-muted-foreground">Demand for submitting &amp; tracking online</p>
      <div class="mt-4 h-52">
        <Doughnut :data="onlineChartData" :options="doughnutOptions" />
      </div>
    </div>
  </div>
</template>
