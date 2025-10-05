import { supabase } from "../../../lib/supabaseClient";
import {
  MathProblem,
  MathProblemSession,
  MathProblemSubmission,
} from "./types";

export class MathProblemModel {
  static async createSession(
    problem: MathProblem
  ): Promise<MathProblemSession> {
    const { data, error } = await supabase
      .from("math_problem_sessions")
      .insert({
        problem_text: problem.problem_text,
        correct_answer: problem.final_answer,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  }

  static async getSession(id: string): Promise<MathProblemSession | null> {
    const { data, error } = await supabase
      .from("math_problem_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to get session: ${error.message}`);
    }

    return data;
  }

  static async createSubmission(
    submission: Omit<MathProblemSubmission, "id" | "created_at">
  ): Promise<MathProblemSubmission> {
    const { data, error } = await supabase
      .from("math_problem_submissions")
      .insert(submission)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create submission: ${error.message}`);
    }

    return data;
  }
}
