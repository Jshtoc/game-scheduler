export interface Profile {
  id: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  game_name: string;
  game_image: string | null;
  start_time: string;
  end_time: string | null;
  max_players: number | null;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleParticipant {
  schedule_id: string;
  user_id: string;
  status: "accepted" | "maybe" | "declined";
  joined_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
}

export interface ScheduleWithOwner extends Schedule {
  profiles: Pick<Profile, "username" | "avatar_url">;
}

export interface FriendshipWithProfile extends Friendship {
  friend: Pick<Profile, "id" | "username" | "avatar_url" | "discord_id">;
}
