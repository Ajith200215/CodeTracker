import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== Role.TEACHER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, section, studentEmails } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Classroom name is required" }, { status: 400 });
    }

    const teacherId = (session.user as any).id;

    // Create Classroom
    const classroom = await db.classroom.create({
      data: {
        name,
        section,
        teacherId,
      },
    });

    // Handle bulk enrollment if emails provided
    let enrolledCount = 0;
    if (studentEmails && typeof studentEmails === "string") {
      // Split by comma or newline and clean up
      const emails = studentEmails
        .split(/[\n,]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0 && e.includes("@"));

      for (const email of emails) {
        // Find or create student placeholder
        let student = await db.user.findUnique({
          where: { email },
        });

        if (!student) {
          student = await db.user.create({
            data: {
              email,
              name: email.split("@")[0], // Placeholder name
              role: Role.STUDENT,
              regNo: null,
            },
          });
        }

        // Create Enrollment (if not already enrolled)
        try {
          await db.enrollment.create({
            data: {
              studentId: student.id,
              classroomId: classroom.id,
            },
          });
          enrolledCount++;
        } catch (e: any) {
          // Ignore unique constraint violation if already enrolled
          if (e.code !== 'P2002') {
             console.error("Enrollment error for", email, e);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      classroomId: classroom.id,
      enrolledCount 
    });

  } catch (error: any) {
    console.error("Error creating classroom:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
