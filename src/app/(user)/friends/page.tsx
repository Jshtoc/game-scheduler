import TwEmoji from "@/components/ui/TwEmoji";
import { createClient } from "@/lib/supabase/server";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? "";

  // 수락된 친구 목록
  const { data: friendships } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, created_at")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  // 친구의 프로필 정보 가져오기
  const friendIds =
    friendships?.map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    ) ?? [];

  const { data: friendProfiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, discord_id")
    .in("id", friendIds.length > 0 ? friendIds : ["none"]);

  // 받은 친구 요청
  const { data: pendingRequests } = await supabase
    .from("friendships")
    .select("id, requester_id, created_at")
    .eq("addressee_id", userId)
    .eq("status", "pending");

  const pendingIds = pendingRequests?.map((r) => r.requester_id) ?? [];

  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", pendingIds.length > 0 ? pendingIds : ["none"]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <TwEmoji emoji="🤝" size={28} />
        <h1 className="text-xl font-bold">친구</h1>
      </div>

      {/* 받은 친구 요청 */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-500">
            받은 요청 ({pendingRequests.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pendingRequests.map((request) => {
              const profile = pendingProfiles?.find(
                (p) => p.id === request.requester_id
              );
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
                >
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <TwEmoji emoji="👤" size={24} />
                    )}
                    <span className="font-medium">
                      {profile?.username ?? "알 수 없음"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/friends/${request.id}`} method="POST">
                      <input type="hidden" name="action" value="accept" />
                      <button
                        type="submit"
                        className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        수락
                      </button>
                    </form>
                    <form action={`/api/friends/${request.id}`} method="POST">
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      >
                        거절
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 친구 목록 */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500">
          친구 목록 ({friendProfiles?.length ?? 0})
        </h2>

        {friendProfiles && friendProfiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {friendProfiles.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                {friend.avatar_url ? (
                  <img
                    src={friend.avatar_url}
                    alt={friend.username}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <TwEmoji emoji="👤" size={20} />
                  </div>
                )}
                <div>
                  <p className="font-medium">{friend.username}</p>
                  <p className="text-xs text-zinc-500">{friend.discord_id}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
            <TwEmoji emoji="🔍" size={40} />
            <p className="text-zinc-500">아직 친구가 없습니다</p>
            <p className="text-sm text-zinc-400">
              Discord ID로 친구를 추가해 보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
