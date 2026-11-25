import { describe, expect, it } from "vitest";

import { feedbackSchema } from "~/utils/feedback-schema";

const validFeedback = {
  fullName: "",
  email: "",
  department: "Home Affairs",
  departmentOther: "",
  experiencedLongQueues: "yes",
  challenges: "I had to return to submit another document.",
  servicesWantedOnline: "I would like to track my application progress.",
  wouldUseOnlinePlatform: "maybe",
  additionalSuggestions: "",
};

describe("feedback form validation", () => {
  it("allows optional contact details to be left blank", () => {
    expect(feedbackSchema.safeParse(validFeedback).success).toBe(true);
  });

  it("requires a service and both written experience answers", () => {
    expect(feedbackSchema.safeParse({ ...validFeedback, department: "" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...validFeedback, challenges: "" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ ...validFeedback, servicesWantedOnline: "" }).success).toBe(
      false,
    );
  });

  it("accepts only the feedback choices shown in the form", () => {
    expect(
      feedbackSchema.safeParse({ ...validFeedback, experiencedLongQueues: "maybe" }).success,
    ).toBe(false);
    expect(
      feedbackSchema.safeParse({ ...validFeedback, wouldUseOnlinePlatform: "sometimes" }).success,
    ).toBe(false);
  });

  it("asks for a department name when Other is selected", () => {
    expect(
      feedbackSchema.safeParse({ ...validFeedback, department: "Other", departmentOther: "" })
        .success,
    ).toBe(false);
    expect(
      feedbackSchema.safeParse({
        ...validFeedback,
        department: "Other",
        departmentOther: "Transport",
      }).success,
    ).toBe(true);
  });

  it("limits free-text feedback to 2,000 characters", () => {
    expect(
      feedbackSchema.safeParse({ ...validFeedback, challenges: "x".repeat(2001) }).success,
    ).toBe(false);
  });
});
