export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
}

export interface FriendshipWithProfile extends Friendship {
  requester: FriendProfile
  addressee: FriendProfile
}

export interface FriendProfile {
  id: string
  discord_id: string
  username: string
  avatar_url: string | null
}

export interface SendFriendRequestBody {
  addressee_id: string
}

export interface UpdateFriendshipBody {
  status: 'accepted' | 'blocked'
}
