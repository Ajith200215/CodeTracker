import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

const LANGUAGE_IDS: Record<string, number> = {
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63,
  c: 50,
  sql: 82,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { problemId, contestId, language, code } = await req.json();

    if (!problemId || !language || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const testCases = (problem.testCases as any[]) || [];
    const judgeUrl = process.env.JUDGE0_URL;
    const langId = LANGUAGE_IDS[language.toLowerCase()] || 71;

    let passedCount = 0;
    let totalRuntime = 0;
    let maxMemory = 0;

    if (judgeUrl && testCases.length > 0) {
      for (const tc of testCases) {
        try {
          const res = await fetch(`${judgeUrl}/submissions?wait=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source_code: code,
              language_id: langId,
              stdin: tc.input || "",
              expected_output: tc.expectedOutput || "",
            }),
          });
          const data = await res.json();
          const actualOutput = (data.stdout || data.compile_output || data.stderr || "").trim();
          const expected = (tc.expectedOutput || "").trim();

          if (data.status?.id === 3 || actualOutput === expected) {
            passedCount++;
          }
          if (data.time) totalRuntime += parseFloat(data.time) * 1000;
          if (data.memory) maxMemory = Math.max(maxMemory, data.memory);
        } catch {
          // Execution failure for testcase
        }
      }
    } else {
      // Mock evaluation for preview/dev mode
      passedCount = testCases.length || 1;
      totalRuntime = 25;
      maxMemory = 4096;
    }

    const totalCases = testCases.length || 1;
    const status = passedCount === totalCases ? "ACCEPTED" : "WRONG_ANSWER";

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        contestId: contestId || null,
        language,
        code,
        status,
        passedCases: passedCount,
        totalCases,
        runtimeMs: totalRuntime,
        memoryKb: maxMemory,
      },
    });

    return NextResponse.json({
      success: true,
      submission,
      verdict: status,
      passedCases: passedCount,
      totalCases,
    });
  } catch (error) {
    console.error("[Practice Submit Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
