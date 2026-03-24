export interface Schedule {
  id: string
  owner_id: string
  title: string
  description: string | null
  game_name: string
  start_time: string
  end_time: string | null
  max_players: number | null
  group_id: string | null
  created_at: string
  updated_at: string
}

export interface ScheduleParticipant {
  schedule_id: string
  user_id: string
  status: 'accepted' | 'maybe' | 'declined'
  joined_at: string
}

export interface CreateScheduleRequest {
  title: string
  description?: string | null
  game_name: string
  start_time: string
  end_time?: string | null
  max_players?: number | null
  group_id?: string | null
}

export interface UpdateScheduleRequest {
  title?: string
  description?: string | null
  game_name?: string
  start_time?: string
  end_time?: string | null
  max_players?: number | null
  group_id?: string | null
}
