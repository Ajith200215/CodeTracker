import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, regNo, branch, role } = body;

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanRegNo = (regNo || "").trim();
    const cleanName = (name || "").trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: "Email or Login ID is required" }, { status: 400 });
    }

    const userRole = role === "TEACHER" ? Role.TEACHER : Role.STUDENT;

    // Search by email or regNo
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(cleanRegNo ? [{ regNo: cleanRegNo }] : []),
        ],
      },
    });

    if (user) {
      // Update existing user profile with latest regNo, branch, name, role
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: cleanName || user.name,
          regNo: cleanRegNo || user.regNo,
          branch: branch || user.branch,
          role: userRole,
        },
      });
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          email: cleanEmail,
          name: cleanName || cleanEmail.split("@")[0],
          role: userRole,
          regNo: cleanRegNo || (userRole === Role.STUDENT ? "2026-CS-0142" : undefined),
          branch: branch || "CSE Core",
          passoutYear: 2026,
        },
      });
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
