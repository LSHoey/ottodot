import { GoogleGenerativeAI } from "@google/generative-ai";
import { MathProblem } from "./types";
import { MathProblemModel } from "./model";

// Load environment variables at module level
const GOOGLE_API_KEY =
  process.env.GOOGLE_API_KEY || "AIzaSyCbjB-OGmZSoOxAqyo5I8QmdoOMOtpwgZQ";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

class MathProblemService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = GEMINI_MODEL;

  private initializeAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      console.log(
        "[MathProblemService] Initializing AI with key length:",
        GOOGLE_API_KEY.length
      );

      if (!GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured");
      }
      this.genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    }
    return this.genAI;
  }

  private getQuestionPrompt(): string {
    return `Generate a math word problem suitable for Primary 5 students (age 10-11). The problem should involve basic arithmetic operations (addition, subtraction, multiplication, division) and be engaging with real-world scenarios.
        Requirements:
        - The problem should be solvable with whole numbers
        - The answer should be a single number (no fractions or decimals)
        - Include context that children can relate to (toys, food, animals, school, etc.)
        - Make it challenging but not too difficult for their age level

        Return the response in this exact JSON format:
        {
        "problem_text": "Your math problem here...",
        "final_answer": numeric answer
        }`;
  }

  async generateProblem(): Promise<{ id: string; problem_text: string }> {
    const ai = this.initializeAI();
    const model = ai.getGenerativeModel({ model: this.modelName });

    const result = await model.generateContent(this.getQuestionPrompt());
    const response = await result.response;
    const text = response.text();
    console.log(text);

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response does not contain valid JSON");
    }

    let problem: MathProblem;
    try {
      problem = JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate response structure
    if (!problem.problem_text || typeof problem.final_answer !== "number") {
      throw new Error("AI response has invalid structure");
    }

    // Save to database
    const session = await MathProblemModel.createSession(problem);

    return {
      id: session.id,
      problem_text: session.problem_text,
    };
  }

  async submitAnswer(
    sessionId: string,
    userAnswer: number
  ): Promise<{
    is_correct: boolean;
    correct_answer: number;
    feedback: string;
  }> {
    // Get the session
    const session = await MathProblemModel.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const isCorrect = userAnswer === session.correct_answer;

    // Generate feedback
    const feedback = await this.generateFeedback(
      session.problem_text,
      session.correct_answer,
      userAnswer,
      isCorrect
    );

    // Save submission
    await MathProblemModel.createSubmission({
      session_id: sessionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      feedback_text: feedback,
    });

    return {
      is_correct: isCorrect,
      correct_answer: session.correct_answer,
      feedback,
    };
  }

  private async generateFeedback(
    problemText: string,
    correctAnswer: number,
    userAnswer: number,
    isCorrect: boolean
  ): Promise<string> {
    const ai = this.initializeAI();
    const model = ai.getGenerativeModel({ model: this.modelName });

    const feedbackPrompt = `Generate personalized feedback for a Primary 5 student who just answered a math problem.
        Problem: ${problemText}
        Correct Answer: ${correctAnswer}
        Student's Answer: ${userAnswer}
        Was Correct: ${isCorrect}
        Provide encouraging feedback that:
        - ${
          isCorrect
            ? "Congratulates them and explains why their answer is correct"
            : "Gently corrects them and helps them understand the right approach"
        }
        - Is age-appropriate and supportive
        - ${
          !isCorrect
            ? "Gives a hint about how to solve it correctly without being too obvious"
            : "Maybe suggests a similar problem they could try"
        }
        - Keep it concise (2-3 sentences max)

        Return only the feedback text, no JSON formatting needed.`;

    const result = await model.generateContent(feedbackPrompt);
    const response = await result.response;
    return response.text().trim();
  }
}

export const mathProblemService = new MathProblemService();
