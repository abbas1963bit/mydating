import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Flag, MessageCircle, Shield, UserRound, Users } from "lucide-react";
import { deleteMember, reviewReport, updateMemberAccess } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";

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
  const errorMessages: Record<string, string> = {
    report: "The report status could not be updated.",
    member: "The account could not be updated.",
    self: "You cannot apply that action to your own administrator account.",
    permission: "Only an administrator can change account access.",
    "service-key": "Set SUPABASE_SERVICE_ROLE_KEY on the server to enable permanent account deletion.",
  };

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small">WeDating operations</span><h1>Administration</h1><p>Review activity, respond to reports, and manage member accounts.</p></div><span className="admin-role"><Shield size={14} />{current.role}</span></div>
      {params.error && <p className="form-error" role="alert">{errorMessages[params.error] ?? "The requested action could not be completed."}</p>}
      {params.updated && <p className="form-success" role="status">Changes saved.</p>}{params.deleted && <p className="form-success" role="status">The account was deleted.</p>}
      <div className="admin-stats">
        <div className="admin-stat"><span><Users size={17} /></span><small>Registered members</small><strong>{totalUsers.count ?? 0}</strong></div>
        <div className="admin-stat"><span><Activity size={17} /></span><small>Active accounts</small><strong>{activeUsers.count ?? 0}</strong></div>
        <div className="admin-stat"><span><UserRound size={17} /></span><small>Joined this week</small><strong>{newUsers.count ?? 0}</strong></div>
        <div className="admin-stat"><span><Flag size={17} /></span><small>Open reports</small><strong>{openReports.count ?? 0}</strong></div>
        <div className="admin-stat"><span><MessageCircle size={17} /></span><small>Conversations</small><strong>{conversations.count ?? 0}</strong></div>
        <div className="admin-stat"><span><Activity size={17} /></span><small>Messages</small><strong>{totalMessages.count ?? 0}</strong></div>
      </div>
      <section className="panel admin-section" id="members"><div className="panel-title"><div><h2>Member accounts</h2><p>Search profiles and review account status.</p></div></div><form className="admin-search" method="get"><label className="sr-only" htmlFor="admin-q">Search members</label><input id="admin-q" name="q" placeholder="Search by display name" defaultValue={q} /><button className="button button-outline" type="submit">Search</button></form>
        <div className="table-scroll"><table className="page-table"><thead><tr><th>Member</th><th>Joined</th><th>Role</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr></thead><tbody>{members?.map((member) => <tr key={member.id}><td><Link href={`/members/${member.id}`} className="admin-member-link">{member.display_name}</Link><small>{[member.city, member.country].filter(Boolean).join(", ") || "Location not set"} · {member.age ? `${member.age} years` : "Age not set"}</small></td><td>{new Date(member.created_at).toLocaleDateString()}</td><td><span className="status-pill">{member.role}</span></td><td><span className={`status-pill ${member.is_active ? "" : "unread"}`}>{member.is_active ? "Active" : "Disabled"}</span>{member.is_verified && <small>Email verified</small>}</td>{isAdmin && <td><div className="admin-member-actions"><form action={updateMemberAccess}><input type="hidden" name="user_id" value={member.id} /><input type="hidden" name="is_active" value={member.is_active ? "false" : "true"} /><select name="role" defaultValue={member.role} aria-label={`Role for ${member.display_name}`}><option value="member">Member</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select><button className="button button-outline button-small" type="submit">Save</button></form><form action={deleteMember}><input type="hidden" name="user_id" value={member.id} /><button className="button button-delete button-small" type="submit">Delete</button></form></div></td>}</tr>)}</tbody></table></div>
        {!members?.length && <div className="empty-inline">No accounts found.</div>}
      </section>
      <section className="panel admin-section" id="reports"><div className="panel-title"><div><h2>Reports for review</h2><p>Reports remain private to the reporter and authorized staff.</p></div><span className="status-pill unread">{reports?.length ?? 0} open</span></div>
        {reports?.length ? <div className="report-list">{reports.map((report) => <article className="report-row" key={report.id}><div className="report-main"><span className="eyebrow-small">{report.reason.replaceAll("_", " ")}</span><strong>{profileNames.get(report.reported_id) ?? "Unavailable member"}</strong><p>{report.details || "No extra details supplied."}</p><small>Reported by {profileNames.get(report.reporter_id) ?? "Unavailable member"} · {new Date(report.created_at).toLocaleString()}</small></div><div className="report-actions"><Link className="text-link" href={`/members/${report.reported_id}`}>View profile</Link><form action={reviewReport}><input type="hidden" name="report_id" value={report.id} /><select name="status" defaultValue={report.status}><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select><button className="button button-outline button-small" type="submit">Update</button></form></div></article>)}</div> : <div className="empty-inline">No open reports. Thank you for looking after the community.</div>}
      </section>
    </>
  );
}