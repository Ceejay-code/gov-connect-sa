import type { FeedbackValues } from "~/utils/feedback-schema";

/**
 * Submits public feedback to the Nitro API endpoint.
 */
export function useFeedbackSubmission() {
  async function submitFeedback(values: FeedbackValues): Promise<{ saved: boolean }> {
    return await $fetch<{ saved: boolean }>("/api/feedback", {
      method: "POST",
      body: values,
    });
  }

  return { submitFeedback };
}
