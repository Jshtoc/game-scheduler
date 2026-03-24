import { NextResponse } from "next/server";
import type { ApiResponse, FriendRequestWithUser } from "@/types/friend";
import {
  getCurrentUserId,
  getPendingRequestsForUser,
  getSentRequestsForUser,
  getUserById,
} from "@/lib/friends-store";

interface FriendRequestsData {
  received: FriendRequestWithUser[];
  sent: FriendRequestWithUser[];
}

export async function GET(): Promise<
  NextResponse<ApiResponse<FriendRequestsData>>
> {
  const currentUserId = getCurrentUserId();

  const pendingRequests = getPendingRequestsForUser(currentUserId);
  const received: FriendRequestWithUser[] = [];
  for (const req of pendingRequests) {
    const sender = getUserById(req.senderId);
    if (sender) {
      received.push({ request: req, sender });
    }
  }

  const sentRequests = getSentRequestsForUser(currentUserId);
  const sent: FriendRequestWithUser[] = [];
  for (const req of sentRequests) {
    const receiver = getUserById(req.receiverId);
    if (receiver) {
      sent.push({ request: req, sender: receiver });
    }
  }

  return NextResponse.json({
    success: true,
    data: { received, sent },
  });
}
