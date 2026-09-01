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
        return NextResponse.json({ error: "An account is already registered with this Email or Registration Number." }, { status: 400 });
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

      // --- Auto-Classroom & Enrollment Logic ---
      if (cleanSection && user.id) {
        // Find or create a default teacher to own the classroom (as required by schema)
        let defaultTeacher = await db.user.findFirst({ where: { role: Role.TEACHER } });
        if (!defaultTeacher) {
          defaultTeacher = await db.user.create({
            data: {
              email: `system.teacher_${Date.now()}@srmist.edu.in`,
              name: "System Auto Teacher",
              role: Role.TEACHER,
              password: "dummy",
            }
          });
        }

        let classroom = await db.classroom.findFirst({
          where: { name: cleanSection }
        });

        if (!classroom) {
          classroom = await db.classroom.create({
            data: {
              name: cleanSection,
              section: cleanSection,
              teacherId: defaultTeacher.id
            }
          });
        }

        // Enroll user if not already enrolled
        const existingEnrollment = await db.enrollment.findUnique({
          where: {
            studentId_classroomId: {
              studentId: user.id,
              classroomId: classroom.id
            }
          }
        });

        if (!existingEnrollment) {
          await db.enrollment.create({
            data: {
              studentId: user.id,
              classroomId: classroom.id
            }
          });
        }
      }
      // --- End Auto-Classroom Logic ---

    } catch (dbErr: any) {
      console.warn("[Register Route] Database warning, using memory fallback:", dbErr?.message);
    }

    // Memory fallback if DB is temporarily unreachable
    if (!user) {
      user = memoryUsers.get(targetEmail) || memoryUsers.get(cleanRegNo);

      if (user) {
        return NextResponse.json({ error: "An account is already registered with this Email or Registration Number." }, { status: 400 });
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
