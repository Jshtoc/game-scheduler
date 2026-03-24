import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type {
  ApiResponse,
  FriendRequest,
  UpdateFriendRequestBody,
} from "@/types/friend";
import {
  getCurrentUserId,
  updateFriendRequestStatus,
} from "@/lib/friends-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<FriendRequest>>> {
  const { id } = await params;
  const currentUserId = getCurrentUserId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("action" in body) ||
    typeof (body as UpdateFriendRequestBody).action !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "action 필드가 필요합니다." },
      { status: 400 }
    );
  }

  const { action } = body as UpdateFriendRequestBody;

  if (action !== "accept" && action !== "reject") {
    return NextResponse.json(
      { success: false, error: "action은 'accept' 또는 'reject'여야 합니다." },
      { status: 400 }
    );
  }

  const status = action === "accept" ? "accepted" : "rejected";
  const result = updateFriendRequestStatus(id, currentUserId, status);

  if ("error" in result) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: result });
}
