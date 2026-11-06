import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Flag, MessageCircle, Shield, UserRound, Users } from "lucide-react";
import { deleteMember, reviewReport, updateMemberAccess } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { LocalizedDate, LocalizedPageText } from "@/components/language-provider";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; updated?: string; deleted?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=setup");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: current } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!current || !["admin", "moderator"].includes(current.role)) redirect("/app");
  const isAdmin = current.role === "admin";
  const q = params.q?.trim().replace(/[%_*(),]/g, " ").slice(0, 60) ?? "";
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [totalUsers, activeUsers, newUsers, openReports, conversations, totalMessages] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
    supabase.from("conversations").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
  ]);
  let memberQuery = supabase.from("profiles").select("id,display_name,age,country,city,role,is_active,is_verified,created_at").order("created_at", { ascending: false }).limit(25);
  if (q) memberQuery = memberQuery.ilike("display_name", `%${q}%`);
  const [{ data: members }, { data: reports }] = await Promise.all([
    memberQuery,
    supabase.from("reports").select("id,reporter_id,reported_id,reason,details,status,created_at").in("status", ["open", "reviewing"]).order("created_at", { ascending: false }).limit(30),
  ]);
  const ids = [...new Set((reports ?? []).flatMap((report) => [report.reporter_id, report.reported_id]))];
  const { data: reportProfiles } = ids.length ? await supabase.from("profiles").select("id,display_name").in("id", ids) : { data: [] };
  const profileNames = new Map((reportProfiles ?? []).map((profile) => [profile.id, profile.display_name]));
  const roleKeys = { member: "roleMember", moderator: "roleModerator", admin: "roleAdmin" } as const;
  const reportReasonKeys = { fake_profile: "fakeProfile", harassment: "harassment", spam: "spam", underage: "underage", inappropriate_content: "inappropriate", other: "reasonOther" } as const;

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="adminEyebrow" /></span><h1><LocalizedPageText translationKey="adminTitle" /></h1><p><LocalizedPageText translationKey="adminIntro" /></p></div><span className="admin-role"><Shield size={14} /><LocalizedPageText translationKey={roleKeys[current.role as keyof typeof roleKeys]} /></span></div>
      {params.error && <p className="form-error" role="alert"><LocalizedPageText translationKey="adminActionError" /></p>}
      {params.updated && <p className="form-success" role="status"><LocalizedPageText translationKey="adminChangesSaved" /></p>}{params.deleted && <p className="form-success" role="status"><LocalizedPageText translationKey="adminDeleted" /></p>}
      <div className="admin-stats">
        <div className="admin-stat"><span><Users size={17} /></span><small><LocalizedPageText translationKey="registeredMembers" /></small><strong>{totalUsers.count ?? 0}</strong></div>
        <div className="admin-stat"><span><Activity size={17} /></span><small><LocalizedPageText translationKey="activeAccounts" /></small><strong>{activeUsers.count ?? 0}</strong></div>
        <div className="admin-stat"><span><UserRound size={17} /></span><small><LocalizedPageText translationKey="joinedThisWeek" /></small><strong>{newUsers.count ?? 0}</strong></div>
        <div className="admin-stat"><span><Flag size={17} /></span><small><LocalizedPageText translationKey="openReports" /></small><strong>{openReports.count ?? 0}</strong></div>
        <div className="admin-stat"><span><MessageCircle size={17} /></span><small><LocalizedPageText translationKey="conversationCount" /></small><strong>{conversations.count ?? 0}</strong></div>
        <div className="admin-stat"><span><Activity size={17} /></span><small><LocalizedPageText translationKey="messageCount" /></small><strong>{totalMessages.count ?? 0}</strong></div>
      </div>
      <section className="panel admin-section" id="members"><div className="panel-title"><div><h2><LocalizedPageText translationKey="memberAccounts" /></h2><p><LocalizedPageText translationKey="memberAccountsHint" /></p></div></div><form className="admin-search" method="get"><label className="sr-only" htmlFor="admin-q"><LocalizedPageText translationKey="searchMembers" /></label><input id="admin-q" name="q" placeholder="" defaultValue={q} /><button className="button button-outline" type="submit"><LocalizedPageText translationKey="search" /></button></form>
        <div className="table-scroll"><table className="page-table"><thead><tr><th><LocalizedPageText translationKey="member" /></th><th><LocalizedPageText translationKey="joined" /></th><th><LocalizedPageText translationKey="role" /></th><th><LocalizedPageText translationKey="status" /></th>{isAdmin && <th><LocalizedPageText translationKey="actions" /></th>}</tr></thead><tbody>{members?.map((member) => <tr key={member.id}><td><Link href={`/members/${member.id}`} className="admin-member-link">{member.display_name}</Link><small>{[member.city, member.country].filter(Boolean).join(", ") || ""} · {member.age ? `${member.age}` : <LocalizedPageText translationKey="ageUnset" />}</small></td><td><LocalizedDate value={member.created_at} /></td><td><span className="status-pill"><LocalizedPageText translationKey={roleKeys[member.role as keyof typeof roleKeys]} /></span></td><td><span className={`status-pill ${member.is_active ? "" : "unread"}`}><LocalizedPageText translationKey={member.is_active ? "active" : "disabled"} /></span>{member.is_verified && <small><LocalizedPageText translationKey="emailVerified" /></small>}</td>{isAdmin && <td><div className="admin-member-actions"><form action={updateMemberAccess}><input type="hidden" name="user_id" value={member.id} /><input type="hidden" name="is_active" value={member.is_active ? "false" : "true"} /><label className="sr-only" htmlFor={`role-${member.id}`}><LocalizedPageText translationKey="roleForMember" variables={{ name: member.display_name }} /></label><select id={`role-${member.id}`} name="role" defaultValue={member.role}><option value="member"><LocalizedPageText translationKey="roleMember" /></option><option value="moderator"><LocalizedPageText translationKey="roleModerator" /></option><option value="admin"><LocalizedPageText translationKey="roleAdmin" /></option></select><button className="button button-outline button-small" type="submit"><LocalizedPageText translationKey="save" /></button></form><form action={deleteMember}><input type="hidden" name="user_id" value={member.id} /><button className="button button-delete button-small" type="submit"><LocalizedPageText translationKey="delete" /></button></form></div></td>}</tr>)}</tbody></table></div>
        {!members?.length && <div className="empty-inline"><LocalizedPageText translationKey="noMembersFound" /></div>}
      </section>
      <section className="panel admin-section" id="reports"><div className="panel-title"><div><h2><LocalizedPageText translationKey="reportsReview" /></h2><p><LocalizedPageText translationKey="reportPrivacy" /></p></div><span className="status-pill unread">{reports?.length ?? 0} <LocalizedPageText translationKey="open" /></span></div>
        {reports?.length ? <div className="report-list">{reports.map((report) => <article className="report-row" key={report.id}><div className="report-main"><span className="eyebrow-small"><LocalizedPageText translationKey={reportReasonKeys[report.reason as keyof typeof reportReasonKeys]} /></span><strong>{profileNames.get(report.reported_id) ?? <LocalizedPageText translationKey="unavailableMember" />}</strong><p>{report.details || <LocalizedPageText translationKey="noReportDetails" />}</p><small><LocalizedPageText translationKey="reportedBy" /> {profileNames.get(report.reporter_id) ?? <LocalizedPageText translationKey="unavailableMember" />} · <LocalizedDate value={report.created_at} withTime /></small></div><div className="report-actions"><Link className="text-link" href={`/members/${report.reported_id}`}><LocalizedPageText translationKey="viewProfile" /></Link><form action={reviewReport}><input type="hidden" name="report_id" value={report.id} /><select name="status" defaultValue={report.status}><option value="reviewing"><LocalizedPageText translationKey="reviewing" /></option><option value="resolved"><LocalizedPageText translationKey="resolved" /></option><option value="dismissed"><LocalizedPageText translationKey="dismissed" /></option></select><button className="button button-outline button-small" type="submit"><LocalizedPageText translationKey="update" /></button></form></div></article>)}</div> : <div className="empty-inline"><LocalizedPageText translationKey="noOpenReports" /></div>}
      </section>
    </>
  );
}