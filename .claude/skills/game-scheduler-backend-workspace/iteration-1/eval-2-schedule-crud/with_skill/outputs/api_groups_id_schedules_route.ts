import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/groups/[id]/schedules - 그룹 스케줄 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: groupId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 사용자가 해당 그룹의 멤버인지 확인
  const { data: membership, error: memberError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return NextResponse.json(
      { error: 'You are not a member of this group' },
      { status: 403 }
    )
  }

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('schedules')
    .select('*, schedule_participants(*, profiles(username, avatar_url)), profiles!schedules_owner_id_fkey(username, avatar_url)')
    .eq('group_id', groupId)
    .order('start_time', { ascending: true })

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
