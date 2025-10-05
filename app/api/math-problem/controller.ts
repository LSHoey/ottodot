import { NextRequest, NextResponse } from "next/server";
import { mathProblemService } from "./service";
import { SubmitAnswerRequest } from "./types";

export class MathProblemController {
  static async generateProblem(): Promise<NextResponse> {
    try {
      console.log("[MathProblemController] Generate problem request");

      const result = await mathProblemService.generateProblem();

      return NextResponse.json({
        id: result.id,
        problem_text: result.problem_text,
        success: true,
      });
    } catch (error) {
      console.error("[MathProblemController] Generate problem error:", error);

      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("GOOGLE_API_KEY")) {
        return NextResponse.json(
          { error: "Server configuration error", success: false },
          { status: 500 }
        );
      } else if (message.includes("AI response")) {
        return NextResponse.json(
          { error: "AI service error", success: false },
          { status: 502 }
        );
      } else {
        return NextResponse.json(
          { error: "Internal server error", success: false },
          { status: 500 }
        );
      }
    }
  }

  static async submitAnswer(request: NextRequest): Promise<NextResponse> {
    try {
      console.log("[MathProblemController] Submit answer request");

      const body: SubmitAnswerRequest = await request.json();
      const { user_answer, session_id } = body;

      // Validate input
      if (!session_id) {
        return NextResponse.json(
          { error: "Session ID is required", success: false },
          { status: 400 }
        );
      }

      if (typeof user_answer !== "number") {
        return NextResponse.json(
          { error: "User answer must be a number", success: false },
          { status: 400 }
        );
      }

      const result = await mathProblemService.submitAnswer(
        session_id,
        user_answer
      );

      return NextResponse.json({
        is_correct: result.is_correct,
        correct_answer: result.correct_answer,
        feedback: result.feedback,
        success: true,
      });
    } catch (error) {
      console.error("[MathProblemController] Submit answer error:", error);

      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("Session not found")) {
        return NextResponse.json(
          { error: "Session not found", success: false },
          { status: 404 }
        );
      } else if (message.includes("GOOGLE_API_KEY")) {
        return NextResponse.json(
          { error: "Server configuration error", success: false },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: "Internal server error", success: false },
          { status: 500 }
        );
      }
    }
  }
}
