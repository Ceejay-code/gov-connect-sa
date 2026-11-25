CREATE TABLE public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text CHECK (full_name IS NULL OR char_length(full_name) <= 100),
  email text CHECK (email IS NULL OR char_length(email) <= 255),
  department text NOT NULL CHECK (department IN ('Home Affairs', 'SASSA / social grants', 'Health', 'Education', 'Employment and Labour', 'Municipal services', 'Transport', 'Other')),
  department_other text,
  experienced_long_queues boolean NOT NULL,
  challenges text NOT NULL CHECK (char_length(btrim(challenges)) BETWEEN 1 AND 2000),
  services_wanted_online text NOT NULL CHECK (char_length(btrim(services_wanted_online)) BETWEEN 1 AND 2000),
  would_use_online_platform text NOT NULL CHECK (would_use_online_platform IN ('yes', 'no', 'maybe')),
  additional_suggestions text CHECK (additional_suggestions IS NULL OR char_length(additional_suggestions) <= 2000),
  CONSTRAINT feedback_submissions_other_department_check CHECK (
    (department = 'Other' AND department_other IS NOT NULL AND char_length(btrim(department_other)) BETWEEN 1 AND 100)
    OR (department <> 'Other' AND department_other IS NULL)
  )
);
GRANT ALL PRIVILEGES ON TABLE public.feedback_submissions TO service_role;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;