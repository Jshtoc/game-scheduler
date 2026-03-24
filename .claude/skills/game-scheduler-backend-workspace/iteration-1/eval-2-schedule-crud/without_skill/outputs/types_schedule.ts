export interface Schedule {
  id: string;
  groupId: string;
  title: string;
  description: string;
  game: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  groupId: string;
  title: string;
  description?: string;
  game: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
}

export interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  game?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
}
