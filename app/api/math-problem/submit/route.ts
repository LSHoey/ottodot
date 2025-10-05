import { NextRequest, NextResponse } from "next/server";
import { MathProblemController } from "../controller";

export async function POST(request: NextRequest) {
  return MathProblemController.submitAnswer(request);
}
