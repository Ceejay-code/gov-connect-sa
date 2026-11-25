import { requireAdminSession } from "~/server/utils/admin-auth";
import { getSupabaseAdmin } from "~/server/utils/supabase";
import { feedbackDepartments } from "~/utils/feedback-schema";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store, private");
  requireAdminSession(event);

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("feedback_submissions")
    .select(
      "id, created_at, full_name, email, department, department_other, experienced_long_queues, challenges, services_wanted_online, would_use_online_platform, additional_suggestions",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Could not load feedback submissions.",
    });
  }

  const items = data ?? [];
  const departmentCounts = new Map<string, number>();
  for (const dept of feedbackDepartments) {
    departmentCounts.set(dept, 0);
  }

  let longQueuesYes = 0;
  let longQueuesNo = 0;
  let onlineYes = 0;
  let onlineMaybe = 0;
  let onlineNo = 0;

  for (const row of items) {
    departmentCounts.set(row.department, (departmentCounts.get(row.department) ?? 0) + 1);
    if (row.experienced_long_queues) longQueuesYes++;
    else longQueuesNo++;

    if (row.would_use_online_platform === "yes") onlineYes++;
    else if (row.would_use_online_platform === "maybe") onlineMaybe++;
    else onlineNo++;
  }

  const byDepartment = Array.from(departmentCounts.entries())
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  return {
    summary: {
      total: items.length,
      longQueues: { yes: longQueuesYes, no: longQueuesNo },
      onlineInterest: { yes: onlineYes, maybe: onlineMaybe, no: onlineNo },
      byDepartment,
    },
    items,
  };
});
