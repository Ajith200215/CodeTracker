import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ section: string }> }) {
  try {
    const { section } = await params;
    if (!section) {
      return NextResponse.json({ error: "Section is required" }, { status: 400 });
    }

    const classroom = await db.classroom.findFirst({
      where: { name: decodeURIComponent(section) },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                platformHandles: {
                  include: {
                    snapshots: {
                      orderBy: { fetchedAt: 'desc' },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, classroom });
  } catch (error: any) {
    console.error(`[Classrooms GET section Error]:`, error);
    return NextResponse.json({ error: "Failed to fetch classroom data" }, { status: 500 });
  }
}
