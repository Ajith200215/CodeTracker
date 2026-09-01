import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import crypto from "crypto";

const memoryUsers = new Map<string, any>();

function hashPassword(pw?: string): string | null {
  if (!pw) return null;
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, regNo, branch, section, role, password } = body;

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanRegNo = (regNo || "").trim();
    const cleanName = (name || "").trim();
    const cleanSection = (section || "").trim();
    const hashedPassword = hashPassword(password);

    if (!cleanEmail && !cleanRegNo) {
      return NextResponse.json({ error: "Email or RA Number is required" }, { status: 400 });
    }

    const userRole = role === "TEACHER" ? Role.TEACHER : Role.STUDENT;
    const targetEmail = cleanEmail || `${cleanRegNo.toLowerCase()}@srmist.edu.in`;

    let user: any = null;

    // Database operation (Supabase PostgreSQL via Prisma)
    try {
      user = await db.user.findFirst({
        where: {
          OR: [
            { email: targetEmail },
            ...(cleanRegNo ? [{ regNo: cleanRegNo }] : []),
          ],
        },
      });

      if (user) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            name: cleanName || user.name,
            regNo: cleanRegNo || user.regNo,
            branch: branch || user.branch,
            section: cleanSection || user.section,
            role: userRole,
            ...(hashedPassword ? { password: hashedPassword } : {}),
          },
        });
      } else {
        user = await db.user.create({
          data: {
            email: targetEmail,
            name: cleanName || targetEmail.split("@")[0],
            password: hashedPassword,
            role: userRole,
            regNo: cleanRegNo || (userRole === Role.STUDENT ? "2026-CS-0142" : undefined),
            branch: branch || "CSE Core",
            section: cleanSection || "A1",
            passoutYear: 2026,
          },
        });
      }
    } catch (dbErr: any) {
      console.warn("[Register Route] Database warning, using memory fallback:", dbErr?.message);
    }

    // Memory fallback if DB is temporarily unreachable
    if (!user) {
      user = memoryUsers.get(targetEmail) || memoryUsers.get(cleanRegNo);

      if (user) {
        user.name = cleanName || user.name;
        user.regNo = cleanRegNo || user.regNo;
        user.branch = branch || user.branch;
        user.section = cleanSection || user.section;
        user.role = userRole;
        if (hashedPassword) user.password = hashedPassword;
      } else {
        user = {
          id: `usr_${Date.now()}`,
          email: targetEmail,
          name: cleanName || targetEmail.split("@")[0],
          password: hashedPassword,
          role: userRole,
          regNo: cleanRegNo || "2026-CS-0142",
          branch: branch || "CSE Core",
          section: cleanSection || "A1",
        };
        memoryUsers.set(targetEmail, user);
        if (cleanRegNo) memoryUsers.set(cleanRegNo, user);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        regNo: user.regNo,
      },
    });
  } catch (error: any) {
    console.error("[Register Route Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Registration failed. Please check inputs." },
      { status: 500 }
    );
  }
}
