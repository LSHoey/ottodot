// API client for math problem operations
interface MathProblemResponse {
  id: string;
  problem_text: string;
  final_answer: number;
}

interface SubmitAnswerResponse {
  is_correct: boolean;
  feedback: string;
  correct_answer: number;
}

export const mathProblemApi = {
  async generateProblem(): Promise<MathProblemResponse> {
    const response = await fetch('/api/math-problem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate problem: ${response.statusText}`);
    }

    return response.json();
  },

  async submitAnswer(sessionId: string, userAnswer: number): Promise<SubmitAnswerResponse> {
    const response = await fetch('/api/math-problem/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_answer: userAnswer,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit answer: ${response.statusText}`);
    }

    return response.json();
  },
};