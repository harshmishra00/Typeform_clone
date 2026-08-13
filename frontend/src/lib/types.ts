export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating';

export interface Question {
  id: string;
  form_id?: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  choices?: string[];
  min_val?: number;
  max_val?: number;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  theme_color: string;
  font_family: string;
  thank_you_title: string;
  thank_you_message: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
  response_count: number;
}

export interface FormListItem {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  theme_color: string;
  created_at: string;
  updated_at: string;
  question_count: number;
  response_count: number;
}

export interface AnswerInput {
  question_id: string;
  value: any;
}

export interface ResponseSubmit {
  answers: AnswerInput[];
  completion_time_seconds?: number;
}

export interface AnswerOut {
  id: string;
  question_id: string;
  value: any;
}

export interface ResponseOut {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time_seconds: number;
  answers: AnswerOut[];
}

export interface QuestionStats {
  question_id: string;
  title: string;
  type: QuestionType;
  total_answers: number;
  choice_counts?: Record<string, number>;
  average_rating?: number;
  numeric_stats?: {
    avg: number;
    min: number;
    max: number;
  };
}
