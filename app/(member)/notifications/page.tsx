import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bell, Eye, Heart, MessageCircle } from "lucide-react";
import { markNotificationRead } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";

export const metadata: Metadata = { title: "Notifications" };

const notificationCopy = {
  like: "sent you some interest",
  visit: "visited your profile",
  message: "sent you a message",
  report_update: "there is an update to your report",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: notifications } = await supabase.from("notifications").select("id,kind,actor_id,reference_id,read_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  const actorIds = [...new Set((notifications ?? []).flatMap((item) => item.actor_id ? [item.actor_id] : []))];
  const { data: actors } = actorIds.length ? await supabase.from("profiles").select("id,display_name,avatar_path").in("id", actorIds) : { data: [] };
  const actorMap = new Map((actors ?? []).map((actor) => [actor.id, actor]));
  const photoUrls = await signedPhotoUrls(supabase, (actors ?? []).map((actor) => actor.avatar_path));
  const icons = { like: Heart, visit: Eye, message: MessageCircle, report_update: Bell };

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small">A note from your community</span><h1>Notifications</h1><p>Likes, profile visits, and messages show up here.</p></div></div>
      {notifications?.length ? <div className="notification-list">{notifications.map((item) => {
        const actor = item.actor_id ? actorMap.get(item.actor_id) : null;
        const Icon = icons[item.kind as keyof typeof icons] ?? Bell;
        const href = item.kind === "message" && item.reference_id ? `/messages/${item.reference_id}` : actor ? `/members/${actor.id}` : "/notifications";
        return <article className={`notification-row ${item.read_at ? "" : "unread"}`} key={item.id}><span className="notification-icon"><Icon size={16} /></span><span className="notification-avatar">{actor?.avatar_path && photoUrls.get(actor.avatar_path) ? <Image src={photoUrls.get(actor.avatar_path)!} alt="" fill sizes="40px" /> : actor?.display_name.slice(0, 1).toUpperCase() ?? "W"}</span><Link href={href} className="notification-copy"><span><strong>{actor?.display_name ?? "WeDating"}</strong> {notificationCopy[item.kind as keyof typeof notificationCopy] ?? "sent an update"}.</span><time>{new Date(item.created_at).toLocaleString()}</time></Link>{!item.read_at && <form action={markNotificationRead}><input type="hidden" name="notification_id" value={item.id} /><button className="mark-read-button" type="submit">Mark read</button></form>}</article>;
      })}</div> : <div className="empty-state"><Bell size={23} /><h2>Nothing new right now</h2><p>When someone likes you, visits your profile, or sends a message, you will find it here.</p><Link className="button button-outline" href="/discover">Discover people</Link></div>}
    </>
  );
}