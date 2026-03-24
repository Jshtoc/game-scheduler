import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/friend";
import {
  getCurrentUserId,
  removeFriendship,
  getUserById,
} from "@/lib/friends-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  const { id: friendId } = await params;
  const currentUserId = getCurrentUserId();

  const friend = getUserById(friendId);
  if (!friend) {
    return NextResponse.json(
      { success: false, error: "사용자를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const removed = removeFriendship(currentUserId, friendId);

  if (!removed) {
    return NextResponse.json(
      { success: false, error: "친구 관계를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { message: "친구가 삭제되었습니다." },
  });
}
