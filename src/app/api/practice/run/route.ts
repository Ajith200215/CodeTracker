import { NextResponse } from "next/server";

// Language ID map for Judge0 CE
const LANGUAGE_IDS: Record<string, number> = {
  cpp: 54,        // C++ (GCC 9.2.0)
  python: 71,     // Python (3.8.1)
  java: 62,       // Java (OpenJDK 13.0.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  c: 50,          // C (GCC 9.2.0)
  sql: 82,        // SQL (SQLite 3.27.2)
};

export async function POST(req: Request) {
  try {
    const { language, sourceCode, testCases } = await req.json();

    if (!sourceCode || !testCases || !Array.isArray(testCases)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const judgeUrl = process.env.JUDGE0_URL;
    const langId = LANGUAGE_IDS[language.toLowerCase()] || 71;

    // Filter to visible test cases only for run mode
    const visibleCases = testCases.filter((tc: any) => !tc.hidden);
    const targetCases = visibleCases.length > 0 ? visibleCases : testCases;

    const results = [];

    if (judgeUrl) {
      for (const tc of targetCases) {
        try {
          const response = await fetch(`${judgeUrl}/submissions?wait=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source_code: sourceCode,
              language_id: langId,
              stdin: tc.input || "",
              expected_output: tc.expectedOutput || "",
            }),
          });
          const data = await response.json();
          const actualOutput = (data.stdout || data.compile_output || data.stderr || "").trim();
          const expected = (tc.expectedOutput || "").trim();
          const passed = data.status?.id === 3 || actualOutput === expected;

          results.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput,
            passed,
            status: data.status?.description || (passed ? "Accepted" : "Wrong Answer"),
            time: data.time ? parseFloat(data.time) * 1000 : null,
            memory: data.memory,
          });
        } catch (e) {
          results.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: "Execution Error",
            passed: false,
            status: "Judge Error",
          });
        }
      }
    } else {
      // Mock sandbox runner for dev testing without local Docker Judge0 instance
      for (const tc of targetCases) {
        const passed = true; // Mock pass for preview
        results.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: tc.expectedOutput || "Output matched",
          passed,
          status: "Accepted (Mock Sandbox)",
          time: 15,
          memory: 2048,
        });
      }
    }

    const allPassed = results.every((r) => r.passed);

    return NextResponse.json({
      success: true,
      allPassed,
      results,
    });
  } catch (error) {
    console.error("[Practice Run Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
