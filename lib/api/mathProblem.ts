// API Configuration and Base URL Logic
export const getApiBaseUrl = (): string => {
  // For Next.js API routes, always use the same origin
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  // Server-side fallback
  return "/api";
};

// Common fetch options
const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface MathProblemResponse {
  id: string;
  problem_text: string;
  success: boolean;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: number;
  feedback: string;
  success: boolean;
}

// API Functions
export const mathProblemApi = {
  async generateProblem(): Promise<MathProblemResponse> {
    const endpoint = `${getApiBaseUrl()}/math-problem`;
    console.log("[API] Generate problem:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: getDefaultHeaders(),
      cache: "no-store",
    });

    console.log("[API] Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[API] Response data:", data);

    if (!data.success) {
      throw new Error(data.error || "Failed to generate problem");
    }

    return data;
  },

  async submitAnswer(
    sessionId: string,
    userAnswer: number
  ): Promise<SubmitAnswerResponse> {
    const endpoint = `${getApiBaseUrl()}/math-problem/submit`;
    console.log("[API] Submit answer:", endpoint, { userAnswer, sessionId });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify({ user_answer: userAnswer, session_id: sessionId }),
      cache: "no-store",
    });

    console.log("[API] Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[API] Response data:", data);

    if (!data.success) {
      throw new Error(data.error || "Failed to submit answer");
    }

    return data;
  },
};
