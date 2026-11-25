export interface FeedbackSubmissionItem {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  department: string;
  department_other: string | null;
  experienced_long_queues: boolean;
  challenges: string;
  services_wanted_online: string;
  would_use_online_platform: string;
  additional_suggestions: string | null;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface FeedbackSummary {
  total: number;
  longQueues: {
    yes: number;
    no: number;
  };
  onlineInterest: {
    yes: number;
    maybe: number;
    no: number;
  };
  byDepartment: DepartmentCount[];
}

export interface AdminFeedbackResponse {
  summary: FeedbackSummary;
  items: FeedbackSubmissionItem[];
}
