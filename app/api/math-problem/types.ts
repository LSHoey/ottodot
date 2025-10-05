// Math Problem Types
export interface MathProblem {
  problem_text: string;
  final_answer: number;
}

export interface MathProblemSession {
  id: string;
  created_at: string;
  problem_text: string;
  correct_answer: number;
}

export interface MathProblemSubmission {
  id: string;
  session_id: string;
  user_answer: number;
  is_correct: boolean;
  feedback_text: string;
  created_at: string;
}

export interface GenerateProblemResponse {
  id: string;
  problem_text: string;
  success: boolean;
}

export interface SubmitAnswerRequest {
  user_answer: number;
  session_id: string;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: number;
  feedback: string;
  success: boolean;
}
