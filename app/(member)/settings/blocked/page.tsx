import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { unblockUser } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { LocalizedDatePhrase, LocalizedPageText } from "@/components/language-provider";

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
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="blockedEyebrow" /></span><h1><LocalizedPageText translationKey="blockedAccounts" /></h1><p><LocalizedPageText translationKey="blockedIntro" /></p></div></div>
      {params.updated && <p className="form-success" role="status"><LocalizedPageText translationKey="adminChangesSaved" /></p>}
      {blocks?.length ? <div className="blocked-list">{blocks.map((block) => <div key={block.blocked_id} className="blocked-row"><span><strong><LocalizedPageText translationKey="blockedMember" /></strong><small><LocalizedDatePhrase translationKey="blockedOn" value={block.created_at} /></small></span><form action={unblockUser}><input type="hidden" name="user_id" value={block.blocked_id} /><button className="button button-outline button-small" type="submit"><LocalizedPageText translationKey="unblock" /></button></form></div>)}</div> : <div className="empty-state"><Shield size={22} /><h2><LocalizedPageText translationKey="noBlocked" /></h2><p><LocalizedPageText translationKey="blockedEmpty" /></p></div>}
    </>
  );
}