import { NextRequest, NextResponse } from "next/server";
import { MathProblemController } from "./controller";

// POST /api/math-problem - Generate a new math problem
export async function POST(request: NextRequest) {
  return await MathProblemController.generateProblem();
}

// GET /api/math-problem - Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GOOGLE_API_KEY),
    timestamp: new Date().toISOString(),
  });
}
