import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateFriendshipBody } from '@/lib/types/friendship'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH /api/friends/[id] - 친구 요청 수락/거절(차단)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: friendshipId } = await params

  const body: unknown = await request.json()

  if (
    typeof body !== 'object' ||
    body === null ||
    !('status' in body) ||
    typeof (body as UpdateFriendshipBody).status !== 'string'
  ) {
    return NextResponse.json(
      { error: 'status is required and must be a string.' },
      { status: 400 }
    )
  }

  const { status } = body as UpdateFriendshipBody

  if (status !== 'accepted' && status !== 'blocked') {
    return NextResponse.json(
      { error: 'status must be "accepted" or "blocked".' },
      { status: 400 }
    )
  }

  // 해당 친구 요청 조회
  const { data: friendship, error: fetchError } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, status')
    .eq('id', friendshipId)
    .single()

  if (fetchError || !friendship) {
    return NextResponse.json(
      { error: 'Friendship not found.' },
      { status: 404 }
    )
  }

  // 수락/거절은 요청을 받은 사람만 가능
  if (friendship.addressee_id !== user.id) {
    return NextResponse.json(
      { error: 'Only the addressee can accept or reject a friend request.' },
      { status: 403 }
    )
  }

  // pending 상태만 변경 가능
  if (friendship.status !== 'pending') {
    return NextResponse.json(
      { error: 'This friend request is no longer pending.' },
      { status: 400 }
    )
  }

  // 상태 업데이트
  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/friends/[id] - 친구 삭제 (양쪽 모두 가능)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: friendshipId } = await params

  // 해당 친구 관계 조회
  const { data: friendship, error: fetchError } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, status')
    .eq('id', friendshipId)
    .single()

  if (fetchError || !friendship) {
    return NextResponse.json(
      { error: 'Friendship not found.' },
      { status: 404 }
    )
  }

  // 관계의 당사자만 삭제 가능
  if (
    friendship.requester_id !== user.id &&
    friendship.addressee_id !== user.id
  ) {
    return NextResponse.json(
      { error: 'You are not part of this friendship.' },
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Friendship deleted.' })
}
