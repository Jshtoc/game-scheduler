import TwEmoji from "@/components/ui/TwEmoji";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth";
import { UsersTable } from "@/components/ui/UsersTable";

export default async function UsersPage() {
  const supabase = await createClient();
  const { role: myRole } = await getCurrentUserRole();
  const isMaster = myRole === "master";

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <UsersTable users={users ?? []} isMaster={isMaster} />
    </div>
  );
}
