import { NextRequest, NextResponse } from "next/server";
import { getSchedulesByGroupId } from "@/lib/scheduleStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  const schedules = getSchedulesByGroupId(groupId);

  return NextResponse.json(schedules);
}
