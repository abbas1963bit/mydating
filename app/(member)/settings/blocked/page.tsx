import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { unblockUser } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Blocked accounts" };

export default async function BlockedAccountsPage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: blocks } = await supabase.from("blocks").select("blocked_id,created_at").eq("blocker_id", user.id).order("created_at", { ascending: false });
  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small">Your boundaries</span><h1>Blocked accounts</h1><p>Blocked members cannot view your profile or send you messages. You can unblock them at any time.</p></div></div>
      {params.updated && <p className="form-success" role="status">Your block list was updated.</p>}
      {blocks?.length ? <div className="blocked-list">{blocks.map((block) => <div key={block.blocked_id} className="blocked-row"><span><strong>Hidden member</strong><small>Blocked {new Date(block.created_at).toLocaleDateString()}</small></span><form action={unblockUser}><input type="hidden" name="user_id" value={block.blocked_id} /><button className="button button-outline button-small" type="submit">Unblock</button></form></div>)}</div> : <div className="empty-state"><Shield size={22} /><h2>No blocked accounts</h2><p>Accounts you block will appear here.</p></div>}
    </>
  );
}