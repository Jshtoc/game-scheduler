export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          discord_id: string
          username: string
          avatar_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          discord_id: string
          username: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          username?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
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
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          game_name: string
          start_time: string
          end_time?: string | null
          max_players?: number | null
          group_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          game_name?: string
          start_time?: string
          end_time?: string | null
          max_players?: number | null
          group_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedule_participants: {
        Row: {
          schedule_id: string
          user_id: string
          status: string
          joined_at: string
        }
        Insert: {
          schedule_id: string
          user_id: string
          status?: string
          joined_at?: string
        }
        Update: {
          schedule_id?: string
          user_id?: string
          status?: string
          joined_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
        }
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}
