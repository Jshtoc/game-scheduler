// SQL migration for friendships table
// Run this in Supabase SQL editor

export const FRIENDSHIPS_MIGRATION = `
-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Prevent duplicate friendships (both directions)
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id),
  -- Prevent self-friendship
  CONSTRAINT no_self_friendship CHECK (requester_id <> addressee_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own friendships (as requester or addressee)
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

-- Users can insert friendships where they are the requester
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
  );

-- Addressee can update friendship status (accept/block)
CREATE POLICY "Addressee can update friendship status"
  ON friendships FOR UPDATE
  USING (
    addressee_id = auth.uid()
  );

-- Either party can delete the friendship
CREATE POLICY "Either party can delete friendship"
  ON friendships FOR DELETE
  USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );
` as const
