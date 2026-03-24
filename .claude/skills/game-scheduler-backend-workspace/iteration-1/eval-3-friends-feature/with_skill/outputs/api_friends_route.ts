import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { SendFriendRequestBody } from '@/lib/types/friendship'

// GET /api/friends - 친구 목록 + 받은 요청 조회
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') ?? 'accepted'

  if (status !== 'pending' && status !== 'accepted') {
    return NextResponse.json(
      { error: 'Invalid status. Must be "pending" or "accepted".' },
      { status: 400 }
    )
  }

  if (status === 'pending') {
    // 내가 받은 친구 요청만 조회
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        addressee_id,
        status,
        created_at,
        requester:profiles!friendships_requester_id_fkey (
          id,
          discord_id,
          username,
          avatar_url
        )
      `)
      .eq('addressee_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  // 수락된 친구 목록 조회 (내가 요청했거나 받은 것 모두)
  const { data: asRequester, error: reqError } = await supabase
    .from('friendships')
    .select(`
      id,
      requester_id,
      addressee_id,
      status,
      created_at,
      addressee:profiles!friendships_addressee_id_fkey (
        id,
        discord_id,
        username,
        avatar_url
      )
    `)
    .eq('requester_id', user.id)
    .eq('status', 'accepted')

  if (reqError) {
    return NextResponse.json({ error: reqError.message }, { status: 500 })
  }

  const { data: asAddressee, error: addrError } = await supabase
    .from('friendships')
    .select(`
      id,
      requester_id,
      addressee_id,
      status,
      created_at,
      requester:profiles!friendships_requester_id_fkey (
        id,
        discord_id,
        username,
        avatar_url
      )
    `)
    .eq('addressee_id', user.id)
    .eq('status', 'accepted')

  if (addrError) {
    return NextResponse.json({ error: addrError.message }, { status: 500 })
  }

  // 친구 프로필을 통일된 형태로 변환
  const friends = [
    ...(asRequester ?? []).map((f) => ({
      friendship_id: f.id,
      friend: f.addressee,
      created_at: f.created_at,
    })),
    ...(asAddressee ?? []).map((f) => ({
      friendship_id: f.id,
      friend: f.requester,
      created_at: f.created_at,
    })),
  ]

  return NextResponse.json(friends)
}

// POST /api/friends - 친구 요청 보내기
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()

  if (
    typeof body !== 'object' ||
    body === null ||
    !('addressee_id' in body) ||
    typeof (body as SendFriendRequestBody).addressee_id !== 'string'
  ) {
    return NextResponse.json(
      { error: 'addressee_id is required and must be a string.' },
      { status: 400 }
    )
  }

  const { addressee_id } = body as SendFriendRequestBody

  // 자기 자신에게 친구 요청 방지
  if (addressee_id === user.id) {
    return NextResponse.json(
      { error: 'Cannot send friend request to yourself.' },
      { status: 400 }
    )
  }

  // 대상 유저 존재 확인
  const { data: targetUser, error: targetError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', addressee_id)
    .single()

  if (targetError || !targetUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  // 기존 관계 확인 (양방향)
  const { data: existing, error: existingError } = await supabase
    .from('friendships')
    .select('id, status, requester_id')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${addressee_id}),and(requester_id.eq.${addressee_id},addressee_id.eq.${user.id})`
    )

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (existing && existing.length > 0) {
    const record = existing[0]
    if (record.status === 'accepted') {
      return NextResponse.json(
        { error: 'Already friends.' },
        { status: 409 }
      )
    }
    if (record.status === 'pending') {
      return NextResponse.json(
        { error: 'Friend request already pending.' },
        { status: 409 }
      )
    }
    if (record.status === 'blocked') {
      return NextResponse.json(
        { error: 'This relationship is blocked.' },
        { status: 403 }
      )
    }
  }

  // 친구 요청 생성
  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
