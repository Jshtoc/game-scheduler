import { NextRequest, NextResponse } from "next/server";
import type { CreateScheduleRequest } from "@/types/schedule";
import {
  getAllSchedules,
  getSchedulesByGroupId,
  createSchedule,
} from "@/lib/scheduleStore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  const schedules = groupId
    ? getSchedulesByGroupId(groupId)
    : getAllSchedules();

  return NextResponse.json(schedules);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.groupId !== "string" ||
    typeof data.title !== "string" ||
    typeof data.game !== "string" ||
    typeof data.startTime !== "string" ||
    typeof data.endTime !== "string" ||
    typeof data.maxParticipants !== "number"
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: groupId, title, game, startTime, endTime, maxParticipants",
      },
      { status: 400 }
    );
  }

  const createData: CreateScheduleRequest = {
    groupId: data.groupId,
    title: data.title,
    game: data.game,
    startTime: data.startTime,
    endTime: data.endTime,
    maxParticipants: data.maxParticipants,
  };

  if (createData.title.trim() === "") {
    return NextResponse.json(
      { error: "Title cannot be empty" },
      { status: 400 }
    );
  }

  if (new Date(createData.endTime) <= new Date(createData.startTime)) {
    return NextResponse.json(
      { error: "endTime must be after startTime" },
      { status: 400 }
    );
  }

  if (createData.maxParticipants < 1) {
    return NextResponse.json(
      { error: "maxParticipants must be at least 1" },
      { status: 400 }
    );
  }

  const description =
    typeof data.description === "string" ? data.description : "";

  const schedule = createSchedule({
    groupId: createData.groupId,
    title: createData.title,
    description,
    game: createData.game,
    startTime: createData.startTime,
    endTime: createData.endTime,
    maxParticipants: createData.maxParticipants,
  });

  return NextResponse.json(schedule, { status: 201 });
}
