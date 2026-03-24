import { NextRequest, NextResponse } from "next/server";
import {
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "@/lib/scheduleStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const schedule = getScheduleById(id);

  if (!schedule) {
    return NextResponse.json(
      { error: "Schedule not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(schedule);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getScheduleById(id);

  if (!existing) {
    return NextResponse.json(
      { error: "Schedule not found" },
      { status: 404 }
    );
  }

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
  const updateData: Record<string, unknown> = {};

  if (typeof data.title === "string") {
    if (data.title.trim() === "") {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }
    updateData.title = data.title;
  }

  if (typeof data.description === "string") {
    updateData.description = data.description;
  }

  if (typeof data.game === "string") {
    updateData.game = data.game;
  }

  if (typeof data.startTime === "string") {
    updateData.startTime = data.startTime;
  }

  if (typeof data.endTime === "string") {
    updateData.endTime = data.endTime;
  }

  if (typeof data.maxParticipants === "number") {
    if (data.maxParticipants < 1) {
      return NextResponse.json(
        { error: "maxParticipants must be at least 1" },
        { status: 400 }
      );
    }
    updateData.maxParticipants = data.maxParticipants;
  }

  const newStartTime =
    typeof updateData.startTime === "string"
      ? updateData.startTime
      : existing.startTime;
  const newEndTime =
    typeof updateData.endTime === "string"
      ? updateData.endTime
      : existing.endTime;

  if (new Date(newEndTime) <= new Date(newStartTime)) {
    return NextResponse.json(
      { error: "endTime must be after startTime" },
      { status: 400 }
    );
  }

  const updated = updateSchedule(id, updateData as {
    title?: string;
    description?: string;
    game?: string;
    startTime?: string;
    endTime?: string;
    maxParticipants?: number;
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteSchedule(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Schedule not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Schedule deleted successfully" });
}
