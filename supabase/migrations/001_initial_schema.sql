-- ============================================
-- Game Scheduler - 초기 스키마
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. profiles (사용자 프로필)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필 본인 조회"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "프로필 본인 수정"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- 2. groups (그룹)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- groups의 SELECT 정책은 group_members 테이블 생성 후 아래에서 정의

CREATE POLICY "그룹 생성"
  ON groups FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "그룹장만 수정"
  ON groups FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "그룹장만 삭제"
  ON groups FOR DELETE
  USING (owner_id = auth.uid());

-- 3. group_members (그룹 멤버)
CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- group_members 생성 후 groups SELECT 정책 추가
CREATE POLICY "그룹 멤버만 조회"
  ON groups FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "그룹 멤버 조회"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "그룹장/관리자가 멤버 추가"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "그룹장만 멤버 삭제"
  ON group_members FOR DELETE
  USING (
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    OR user_id = auth.uid()
  );

-- 4. schedules (스케줄)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  game_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  max_players INT,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 스케줄 + 그룹 스케줄 조회"
  ON schedules FOR SELECT
  USING (
    owner_id = auth.uid()
    OR group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "스케줄 생성"
  ON schedules FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "본인 스케줄만 수정"
  ON schedules FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "본인 스케줄만 삭제"
  ON schedules FOR DELETE
  USING (owner_id = auth.uid());

-- 5. schedule_participants (스케줄 참가자)
CREATE TABLE schedule_participants (
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'maybe', 'declined')),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (schedule_id, user_id)
);

ALTER TABLE schedule_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "참가자 조회"
  ON schedule_participants FOR SELECT
  USING (
    schedule_id IN (
      SELECT id FROM schedules WHERE
        owner_id = auth.uid()
        OR group_id IN (
          SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "본인 참가 등록"
  ON schedule_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "본인 참가 수정"
  ON schedule_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "본인 참가 취소"
  ON schedule_participants FOR DELETE
  USING (user_id = auth.uid());

-- 6. friendships (친구 관계)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 관련 친구 관계 조회"
  ON friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "친구 요청 보내기"
  ON friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "받은 요청만 상태 변경"
  ON friendships FOR UPDATE
  USING (addressee_id = auth.uid());

CREATE POLICY "양쪽 모두 삭제 가능"
  ON friendships FOR DELETE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- ============================================
-- 인덱스
-- ============================================
CREATE INDEX idx_schedules_owner ON schedules(owner_id);
CREATE INDEX idx_schedules_group ON schedules(group_id);
CREATE INDEX idx_schedules_start_time ON schedules(start_time);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_schedule_participants_user ON schedule_participants(user_id);

-- ============================================
-- updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Discord 로그인 시 자동 프로필 생성
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, discord_id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'provider_id', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
