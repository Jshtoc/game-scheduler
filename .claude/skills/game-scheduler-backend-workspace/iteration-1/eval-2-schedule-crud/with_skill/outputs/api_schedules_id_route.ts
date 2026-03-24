import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateScheduleRequest } from '@/types/schedule'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/schedules/[id] - 스케줄 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('schedules')
    .select('*, schedule_participants(*, profiles(username, avatar_url)), profiles!schedules_owner_id_fkey(username, avatar_url)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH /api/schedules/[id] - 스케줄 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 스케줄 소유자 확인
  const { data: existing, error: fetchError } = await supabase
    .from('schedules')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (existing.owner_id !== user.id) {
    return NextResponse.json(
      { error: 'Only the schedule owner can update this schedule' },
      { status: 403 }
    )
  }

  const body: unknown = await request.json()

  if (!isUpdateScheduleRequest(body)) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  // group_id 변경 시 멤버십 확인
  if (body.group_id !== undefined && body.group_id !== null) {
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', body.group_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }
  }

  const updateData: Record<string, unknown> = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.game_name !== undefined) updateData.game_name = body.game_name
  if (body.start_time !== undefined) updateData.start_time = body.start_time
  if (body.end_time !== undefined) updateData.end_time = body.end_time
  if (body.max_players !== undefined) updateData.max_players = body.max_players
  if (body.group_id !== undefined) updateData.group_id = body.group_id
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('schedules')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/schedules/[id] - 스케줄 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 스케줄 소유자 확인
  const { data: existing, error: fetchError } = await supabase
    .from('schedules')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (existing.owner_id !== user.id) {
    return NextResponse.json(
      { error: 'Only the schedule owner can delete this schedule' },
      { status: 403 }
    )
  }

  // 참가자 먼저 삭제 (FK 제약)
  await supabase
    .from('schedule_participants')
    .delete()
    .eq('schedule_id', id)

  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Schedule deleted' })
}

function isUpdateScheduleRequest(body: unknown): body is UpdateScheduleRequest {
  if (typeof body !== 'object' || body === null) return false
  const obj = body as Record<string, unknown>

  // 최소한 하나의 유효한 필드가 있어야 함
  const validKeys = ['title', 'description', 'game_name', 'start_time', 'end_time', 'max_players', 'group_id']
  const hasValidKey = validKeys.some((key) => key in obj)
  if (!hasValidKey) return false

  // 타입 검증
  if ('title' in obj && typeof obj.title !== 'string') return false
  if ('game_name' in obj && typeof obj.game_name !== 'string') return false
  if ('start_time' in obj && typeof obj.start_time !== 'string') return false
  if ('end_time' in obj && obj.end_time !== null && typeof obj.end_time !== 'string') return false
  if ('description' in obj && obj.description !== null && typeof obj.description !== 'string') return false
  if ('max_players' in obj && obj.max_players !== null && typeof obj.max_players !== 'number') return false
  if ('group_id' in obj && obj.group_id !== null && typeof obj.group_id !== 'string') return false

  return true
}
