import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bell, Eye, Heart, MessageCircle } from "lucide-react";
import { markNotificationRead } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";
import { LocalizedDate, LocalizedPageText } from "@/components/language-provider";

export const metadata: Metadata = { title: "Notifications" };

const notificationKeys = { like: "notificationLike", visit: "notificationVisit", message: "notificationMessage", report_update: "notificationReport" } as const;

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
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="notificationsTitle" /></span><h1><LocalizedPageText translationKey="notificationsTitle" /></h1><p><LocalizedPageText translationKey="notificationsIntro" /></p></div></div>
      {notifications?.length ? <div className="notification-list">{notifications.map((item) => {
        const actor = item.actor_id ? actorMap.get(item.actor_id) : null;
        const Icon = icons[item.kind as keyof typeof icons] ?? Bell;
        const href = item.kind === "message" && item.reference_id ? `/messages/${item.reference_id}` : actor ? `/members/${actor.id}` : "/notifications";
        const copyKey = item.kind in notificationKeys ? notificationKeys[item.kind as keyof typeof notificationKeys] : "notificationUpdate";
        return <article className={`notification-row ${item.read_at ? "" : "unread"}`} key={item.id}><span className="notification-icon"><Icon size={16} /></span><span className="notification-avatar">{actor?.avatar_path && photoUrls.get(actor.avatar_path) ? <Image src={photoUrls.get(actor.avatar_path)!} alt="" fill sizes="40px" /> : actor?.display_name.slice(0, 1).toUpperCase() ?? "W"}</span><Link href={href} className="notification-copy"><span><strong>{actor?.display_name ?? "WeDating"}</strong> <LocalizedPageText translationKey={copyKey} />.</span><time><LocalizedDate value={item.created_at} withTime /></time></Link>{!item.read_at && <form action={markNotificationRead}><input type="hidden" name="notification_id" value={item.id} /><button className="mark-read-button" type="submit"><LocalizedPageText translationKey="markRead" /></button></form>}</article>;
      })}</div> : <div className="empty-state"><Bell size={23} /><h2><LocalizedPageText translationKey="notificationsEmptyTitle" /></h2><p><LocalizedPageText translationKey="notificationsEmptyBody" /></p><Link className="button button-outline" href="/discover"><LocalizedPageText translationKey="discoverMembers" /></Link></div>}
    </>
  );
}