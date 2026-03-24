export interface User {
  id: string;
  username: string;
  displayName: string;
}

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
}

export interface FriendWithUser {
  friendshipId: string;
  user: User;
  since: string;
}

export interface FriendRequestWithUser {
  request: FriendRequest;
  sender: User;
}

export interface SendFriendRequestBody {
  receiverUsername: string;
}

export interface UpdateFriendRequestBody {
  action: "accept" | "reject";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
