---
name: game-scheduler-backend
description: >
  Game Scheduler 프로젝트의 백엔드 API, 데이터베이스, 인증을 구현하는 스킬.
  Supabase(PostgreSQL) + Discord OAuth + Next.js Route Handlers 기반.
  사용자가 API 엔드포인트 추가, DB 스키마 수정, 인증 처리, 스케줄 CRUD,
  그룹/친구 관리 등 백엔드 관련 작업을 요청할 때 이 스킬을 사용한다.
  "API 만들어줘", "DB 테이블 추가해줘", "로그인 구현해줘", "스케줄 공유 기능",
  "친구 추가 기능" 등의 요청에 트리거된다.
---

# Game Scheduler Backend

게임 스케줄을 친구/그룹 단위로 공유하는 서비스의 백엔드 구현 가이드.

## Tech Stack

- **Runtime**: Next.js 16 App Router (Route Handlers)
- **Database**: Supabase (PostgreSQL) - 무료 티어
- **Auth**: Discord OAuth (Supabase Auth 연동)
- **Language**: TypeScript (strict, `any` 금지)

## Architecture

```
src/
├── app/
│   └── api/                    # Route Handlers
│       ├── auth/
│       │   ├── discord/route.ts    # Discord OAuth 시작
│       │   ├── callback/route.ts   # OAuth 콜백
│       │   └── logout/route.ts     # 로그아웃
│       ├── users/
│       │   ├── me/route.ts         # 내 정보 조회/수정
│       │   └── [id]/route.ts       # 특정 유저 조회
│       ├── schedules/
│       │   ├── route.ts            # 스케줄 목록/생성
│       │   └── [id]/route.ts       # 스케줄 조회/수정/삭제
│       ├── groups/
│       │   ├── route.ts            # 그룹 목록/생성
│       │   ├── [id]/route.ts       # 그룹 조회/수정/삭제
│       │   └── [id]/members/route.ts  # 멤버 관리
│       └── friends/
│           ├── route.ts            # 친구 목록/요청
│           └── [id]/route.ts       # 친구 수락/거절/삭제
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase 브라우저 클라이언트
│   │   ├── server.ts           # Supabase 서버 클라이언트
│   │   └── middleware.ts       # Auth 미들웨어 헬퍼
│   └── types/
│       └── database.ts         # Supabase 생성 타입
└── middleware.ts               # Next.js 미들웨어 (세션 갱신)
```

## Database Schema

Supabase에서 아래 테이블을 사용한다. RLS(Row Level Security)를 반드시 활성화한다.

### profiles
Discord 사용자 정보를 저장한다. Supabase Auth의 `auth.users`와 연동.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK → auth.users.id) | 사용자 ID |
| discord_id | text (unique) | Discord 사용자 ID |
| username | text | 표시 이름 |
| avatar_url | text | 프로필 이미지 URL |
| created_at | timestamptz | 가입일 |
| updated_at | timestamptz | 수정일 |

### schedules
게임 스케줄을 저장한다.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | 스케줄 ID |
| owner_id | uuid (FK → profiles.id) | 생성자 |
| title | text | 제목 |
| description | text | 설명 (nullable) |
| game_name | text | 게임 이름 |
| start_time | timestamptz | 시작 시간 |
| end_time | timestamptz | 종료 시간 (nullable) |
| max_players | int | 최대 인원 (nullable) |
| group_id | uuid (FK → groups.id, nullable) | 연결된 그룹 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

### schedule_participants
스케줄 참가자를 관리한다.

| Column | Type | Description |
|--------|------|-------------|
| schedule_id | uuid (FK → schedules.id) | 스케줄 |
| user_id | uuid (FK → profiles.id) | 참가자 |
| status | text | 'accepted' / 'maybe' / 'declined' |
| joined_at | timestamptz | 참가일 |

### groups
그룹을 관리한다.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | 그룹 ID |
| name | text | 그룹 이름 |
| description | text | 설명 (nullable) |
| owner_id | uuid (FK → profiles.id) | 그룹장 |
| created_at | timestamptz | 생성일 |

### group_members
그룹 멤버를 관리한다.

| Column | Type | Description |
|--------|------|-------------|
| group_id | uuid (FK → groups.id) | 그룹 |
| user_id | uuid (FK → profiles.id) | 멤버 |
| role | text | 'owner' / 'admin' / 'member' |
| joined_at | timestamptz | 가입일 |

### friendships
친구 관계를 관리한다. 요청자(requester)와 수신자(addressee) 양방향.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | 관계 ID |
| requester_id | uuid (FK → profiles.id) | 요청자 |
| addressee_id | uuid (FK → profiles.id) | 수신자 |
| status | text | 'pending' / 'accepted' / 'blocked' |
| created_at | timestamptz | 요청일 |

## API Route Handler 패턴

모든 Route Handler는 이 패턴을 따른다:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 비즈니스 로직
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

핵심 원칙:
- `createClient()`는 매 요청마다 새로 생성 (서버 컴포넌트용 클라이언트)
- 인증이 필요한 엔드포인트는 반드시 `getUser()`로 확인 후 진행
- Supabase RLS가 1차 보안이지만, API 레벨에서도 권한 체크
- 에러 응답은 `{ error: string }` 형식으로 통일
- 성공 응답은 데이터를 직접 반환

## Supabase 클라이언트 설정

### 서버 클라이언트 (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
```

### 브라우저 클라이언트 (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## Discord OAuth 설정

Supabase 대시보드에서 Discord provider를 활성화하고, Discord Developer Portal에서 OAuth2 앱을 생성한다.

### 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 로그인 시작 (`api/auth/discord/route.ts`)
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const origin = request.nextUrl.origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(data.url)
}
```

### 콜백 처리 (`api/auth/callback/route.ts`)
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

## RLS 정책 가이드

모든 테이블에 RLS를 활성화하고 정책을 설정한다.

```sql
-- profiles: 본인만 수정 가능, 같은 그룹/친구는 조회 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view friends and group members"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT addressee_id FROM friendships WHERE requester_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT requester_id FROM friendships WHERE addressee_id = auth.uid() AND status = 'accepted'
    )
    OR id IN (
      SELECT user_id FROM group_members WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- schedules: 본인 것 + 소속 그룹의 스케줄만 조회
CREATE POLICY "Users can view own and group schedules"
  ON schedules FOR SELECT
  USING (
    owner_id = auth.uid()
    OR group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );
```

## 필수 패키지

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Middleware (세션 갱신)

`src/middleware.ts`에서 모든 요청에 대해 세션을 갱신한다:

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```
