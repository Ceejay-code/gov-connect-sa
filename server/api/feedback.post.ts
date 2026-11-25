import { feedbackSchema } from "~/utils/feedback-schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid feedback submission.",
      data: parsed.error.issues,
    });
  }

  const data = parsed.data;
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from("feedback_submissions").insert({
    full_name: data.fullName || null,
    email: data.email || null,
    department: data.department,
    department_other: data.department === "Other" ? data.departmentOther : null,
    experienced_long_queues: data.experiencedLongQueues === "yes",
    challenges: data.challenges,
    services_wanted_online: data.servicesWantedOnline,
    would_use_online_platform: data.wouldUseOnlinePlatform,
    additional_suggestions: data.additionalSuggestions || null,
  });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "We could not save your feedback just now. Please try again.",
    });
  }

  return { saved: true };
});
