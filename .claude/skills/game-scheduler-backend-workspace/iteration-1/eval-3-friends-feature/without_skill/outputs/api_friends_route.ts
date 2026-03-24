import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type {
  ApiResponse,
  FriendWithUser,
  FriendRequest,
  SendFriendRequestBody,
} from "@/types/friend";
import {
  getCurrentUserId,
  getFriendsForUser,
  getUserById,
  getUserByUsername,
  createFriendRequest,
} from "@/lib/friends-store";

export async function GET(): Promise<NextResponse<ApiResponse<FriendWithUser[]>>> {
  const currentUserId = getCurrentUserId();
  const friendships = getFriendsForUser(currentUserId);

  const friends: FriendWithUser[] = [];
  for (const fs of friendships) {
    const user = getUserById(fs.friendId);
    if (user) {
      friends.push({
        friendshipId: fs.id,
        user,
        since: fs.createdAt,
      });
    }
  }

  return NextResponse.json({ success: true, data: friends });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<FriendRequest>>> {
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
    !("receiverUsername" in body) ||
    typeof (body as SendFriendRequestBody).receiverUsername !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "사용자 이름을 입력해주세요." },
      { status: 400 }
    );
  }

  const { receiverUsername } = body as SendFriendRequestBody;
  const receiver = getUserByUsername(receiverUsername);

  if (!receiver) {
    return NextResponse.json(
      { success: false, error: "해당 사용자를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const result = createFriendRequest(currentUserId, receiver.id);

  if ("error" in result) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, data: result }, { status: 201 });
}
