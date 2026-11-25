<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartEvent,
  type ActiveElement,
} from "chart.js";
import { Bar } from "vue-chartjs";
import type { DepartmentCount } from "~/utils/admin-types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: DepartmentCount[];
  selectedDepartment: string;
}>();

const emit = defineEmits<{
  "select-department": [department: string];
}>();

const chartData = computed(() => ({
  labels: props.data.map((d) => d.department),
  datasets: [
    {
      label: "Responses",
      data: props.data.map((d) => d.count),
      backgroundColor: props.data.map((d) =>
        props.selectedDepartment && props.selectedDepartment !== d.department
          ? "rgba(27, 54, 93, 0.25)"
          : "#1d7a4c",
      ),
      borderRadius: 6,
      barThickness: 22,
    },
  ],
}));

const chartOptions = computed(() => ({
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
    const first = elements[0];
    if (!first) return;
    const item = props.data[first.index];
    if (!item) return;
    emit("select-department", props.selectedDepartment === item.department ? "" : item.department);
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { x: number | null } }) =>
          `${ctx.parsed.x ?? 0} response${ctx.parsed.x === 1 ? "" : "s"}`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0, color: "#475569" },
      grid: { color: "rgba(148, 163, 184, 0.2)" },
    },
    y: {
      ticks: { color: "#1e293b", font: { size: 12, weight: 500 } },
      grid: { display: false },
    },
  },
}));
</script>

<template>
  <div class="h-72 w-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
