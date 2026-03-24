import type {
  User,
  FriendRequest,
  Friendship,
  FriendRequestStatus,
} from "@/types/friend";

const users: Map<string, User> = new Map();
const friendRequests: Map<string, FriendRequest> = new Map();
const friendships: Map<string, Friendship> = new Map();

let requestIdCounter = 1;
let friendshipIdCounter = 1;

function initializeSeedData(): void {
  if (users.size > 0) return;

  const seedUsers: User[] = [
    { id: "user-1", username: "player1", displayName: "Player One" },
    { id: "user-2", username: "player2", displayName: "Player Two" },
    { id: "user-3", username: "player3", displayName: "Player Three" },
    { id: "user-4", username: "player4", displayName: "Player Four" },
    { id: "user-5", username: "player5", displayName: "Player Five" },
  ];

  for (const user of seedUsers) {
    users.set(user.id, user);
  }
}

initializeSeedData();

export function getCurrentUserId(): string {
  return "user-1";
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function getUserByUsername(username: string): User | undefined {
  for (const user of users.values()) {
    if (user.username === username) {
      return user;
    }
  }
  return undefined;
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function createFriendRequest(
  senderId: string,
  receiverId: string
): FriendRequest | { error: string } {
  if (senderId === receiverId) {
    return { error: "자기 자신에게 친구 요청을 보낼 수 없습니다." };
  }

  if (!users.has(senderId) || !users.has(receiverId)) {
    return { error: "사용자를 찾을 수 없습니다." };
  }

  if (areFriends(senderId, receiverId)) {
    return { error: "이미 친구입니다." };
  }

  for (const request of friendRequests.values()) {
    if (
      request.status === "pending" &&
      ((request.senderId === senderId && request.receiverId === receiverId) ||
        (request.senderId === receiverId && request.receiverId === senderId))
    ) {
      return { error: "이미 보낸 또는 받은 친구 요청이 있습니다." };
    }
  }

  const now = new Date().toISOString();
  const request: FriendRequest = {
    id: `req-${requestIdCounter++}`,
    senderId,
    receiverId,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  friendRequests.set(request.id, request);
  return request;
}

export function getPendingRequestsForUser(userId: string): FriendRequest[] {
  const results: FriendRequest[] = [];
  for (const request of friendRequests.values()) {
    if (request.receiverId === userId && request.status === "pending") {
      results.push(request);
    }
  }
  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getSentRequestsForUser(userId: string): FriendRequest[] {
  const results: FriendRequest[] = [];
  for (const request of friendRequests.values()) {
    if (request.senderId === userId && request.status === "pending") {
      results.push(request);
    }
  }
  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateFriendRequestStatus(
  requestId: string,
  userId: string,
  status: FriendRequestStatus
): FriendRequest | { error: string } {
  const request = friendRequests.get(requestId);

  if (!request) {
    return { error: "친구 요청을 찾을 수 없습니다." };
  }

  if (request.receiverId !== userId) {
    return { error: "이 친구 요청을 처리할 권한이 없습니다." };
  }

  if (request.status !== "pending") {
    return { error: "이미 처리된 친구 요청입니다." };
  }

  request.status = status;
  request.updatedAt = new Date().toISOString();
  friendRequests.set(requestId, request);

  if (status === "accepted") {
    addFriendship(request.senderId, request.receiverId);
  }

  return request;
}

function addFriendship(userId1: string, userId2: string): void {
  const now = new Date().toISOString();

  const friendship1: Friendship = {
    id: `fs-${friendshipIdCounter++}`,
    userId: userId1,
    friendId: userId2,
    createdAt: now,
  };

  const friendship2: Friendship = {
    id: `fs-${friendshipIdCounter++}`,
    userId: userId2,
    friendId: userId1,
    createdAt: now,
  };

  friendships.set(friendship1.id, friendship1);
  friendships.set(friendship2.id, friendship2);
}

export function areFriends(userId1: string, userId2: string): boolean {
  for (const fs of friendships.values()) {
    if (fs.userId === userId1 && fs.friendId === userId2) {
      return true;
    }
  }
  return false;
}

export function getFriendsForUser(userId: string): Friendship[] {
  const results: Friendship[] = [];
  for (const fs of friendships.values()) {
    if (fs.userId === userId) {
      results.push(fs);
    }
  }
  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function removeFriendship(
  userId: string,
  friendId: string
): boolean {
  const toRemove: string[] = [];

  for (const [key, fs] of friendships.entries()) {
    if (
      (fs.userId === userId && fs.friendId === friendId) ||
      (fs.userId === friendId && fs.friendId === userId)
    ) {
      toRemove.push(key);
    }
  }

  if (toRemove.length === 0) {
    return false;
  }

  for (const key of toRemove) {
    friendships.delete(key);
  }

  return true;
}
