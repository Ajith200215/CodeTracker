import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StudentDashboardView } from "@/components/dashboard/StudentDashboardView";
import { format, subDays } from "date-fns";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/unauthorized");
  }

  const studentId = (session.user as any).id;

  // Phase 5: Fetch historical PlatformStatSnapshot data for the line chart
  const user = await db.user.findUnique({
    where: { id: studentId },
    include: {
      platformHandles: {
        select: { id: true }
      }
    }
  });

  const handleIds = user?.platformHandles.map(h => h.id) || [];

  const snapshots = await db.platformStatSnapshot.findMany({
    where: { handleId: { in: handleIds } },
    orderBy: { fetchedAt: 'asc' }
  });

  // Group by week or day to create trend data
  // For MVP, we'll bucket by the last 6 weeks
  const chartData: { week: string; solved: number }[] = [];
  
  if (snapshots.length === 0) {
    // If no snapshots, pass null to use default mockup in the view
  } else {
    // Group snapshots by date (simplified for MVP: group by simple date string)
    const groupedByDate: Record<string, number> = {};
    snapshots.forEach(s => {
      const dateStr = format(s.fetchedAt, 'MMM dd');
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = 0;
      groupedByDate[dateStr] += s.totalSolved;
    });

    const entries = Object.entries(groupedByDate).slice(-6); // Get last 6 entries
    
    // Fill chart data
    entries.forEach(([dateStr, solved]) => {
      chartData.push({ week: dateStr, solved });
    });
  }

  return (
    <StudentDashboardView 
      onStartExam={async () => {
        "use server";
        redirect("/student/tests/some-test-id/attempt");
      }}
      initialChartData={chartData.length > 0 ? chartData : undefined}
    />
  );
}
