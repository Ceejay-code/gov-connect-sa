import { z } from "zod";

export const feedbackDepartments = [
  "Home Affairs",
  "SASSA / social grants",
  "Health",
  "Education",
  "Employment and Labour",
  "Municipal services",
  "Transport",
  "Other",
] as const;

const requiredChoice = <T extends readonly [string, ...string[]]>(choices: T, message: string) =>
  z.string().min(1, message).pipe(z.enum(choices));

export const feedbackSchema = z
  .object({
    fullName: z.string().trim().max(100, "Keep your name under 100 characters."),
    email: z.union([
      z.literal(""),
      z
        .string()
        .trim()
        .max(255, "Keep your email under 255 characters.")
        .email("Enter a valid email address."),
    ]),
    department: requiredChoice(feedbackDepartments, "Choose a service or department."),
    departmentOther: z.string().trim().max(100, "Keep this under 100 characters."),
    experiencedLongQueues: requiredChoice(["yes", "no"], "Choose Yes or No."),
    challenges: z
      .string()
      .trim()
      .min(1, "Tell us about a challenge you experienced.")
      .max(2000, "Keep your answer under 2,000 characters."),
    servicesWantedOnline: z
      .string()
      .trim()
      .min(1, "Tell us which services you would like to access online.")
      .max(2000, "Keep your answer under 2,000 characters."),
    wouldUseOnlinePlatform: requiredChoice(["yes", "no", "maybe"], "Choose Yes, No, or Maybe."),
    additionalSuggestions: z.string().trim().max(2000, "Keep your answer under 2,000 characters."),
  })
  .superRefine((values, context) => {
    if (values.department === "Other" && values.departmentOther.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["departmentOther"],
        message: "Tell us which service or department you mean.",
      });
    }
  });

export type FeedbackValues = z.input<typeof feedbackSchema>;
