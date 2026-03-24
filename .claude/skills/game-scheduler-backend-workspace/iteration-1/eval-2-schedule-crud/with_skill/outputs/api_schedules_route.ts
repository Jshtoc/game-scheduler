import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateScheduleRequest } from '@/types/schedule'

// GET /api/schedules - 내 스케줄 목록 조회
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const groupId = searchParams.get('group_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('schedules')
    .select('*, schedule_participants(*), profiles!schedules_owner_id_fkey(username, avatar_url)')
    .order('start_time', { ascending: true })

  if (groupId) {
    // 특정 그룹의 스케줄만 조회
    query = query.eq('group_id', groupId)
  } else {
    // 내 스케줄 + 내가 소속된 그룹의 스케줄
    // RLS 정책이 이를 처리하지만, 명시적으로 필터링할 수도 있음
    query = query.or(`owner_id.eq.${user.id},group_id.not.is.null`)
  }

  if (from) {
    query = query.gte('start_time', from)
  }
  if (to) {
    query = query.lte('start_time', to)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/schedules - 스케줄 생성
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()

  // 요청 바디 검증
  if (!isCreateScheduleRequest(body)) {
    return NextResponse.json(
      { error: 'title, game_name, and start_time are required' },
      { status: 400 }
    )
  }

  // group_id가 지정된 경우, 사용자가 해당 그룹의 멤버인지 확인
  if (body.group_id) {
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

  const { data, error } = await supabase
    .from('schedules')
    .insert({
      owner_id: user.id,
      title: body.title,
      description: body.description ?? null,
      game_name: body.game_name,
      start_time: body.start_time,
      end_time: body.end_time ?? null,
      max_players: body.max_players ?? null,
      group_id: body.group_id ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 생성자를 참가자로 자동 추가
  await supabase
    .from('schedule_participants')
    .insert({
      schedule_id: data.id,
      user_id: user.id,
      status: 'accepted',
    })

  return NextResponse.json(data, { status: 201 })
}

function isCreateScheduleRequest(body: unknown): body is CreateScheduleRequest {
  if (typeof body !== 'object' || body === null) return false
  const obj = body as Record<string, unknown>
  return (
    typeof obj.title === 'string' &&
    obj.title.length > 0 &&
    typeof obj.game_name === 'string' &&
    obj.game_name.length > 0 &&
    typeof obj.start_time === 'string' &&
    obj.start_time.length > 0
  )
}
