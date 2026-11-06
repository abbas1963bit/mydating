import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";
import { LocalizedNav, LocalizedPageText } from "@/components/language-provider";

export const metadata: Metadata = { title: "Likes" };

export default async function LikesPage({ searchParams }: { searchParams: Promise<{ view?: string; updated?: string; error?: string }> }) {
  const params = await searchParams;
  const view = params.view === "sent" ? "sent" : "received";
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: likes } = view === "received"
    ? await supabase.from("likes").select("from_user_id,to_user_id,created_at").eq("to_user_id", user.id).order("created_at", { ascending: false }).limit(50)
    : await supabase.from("likes").select("from_user_id,to_user_id,created_at").eq("from_user_id", user.id).order("created_at", { ascending: false }).limit(50);
  const ids = [...new Set((likes ?? []).map((like) => view === "received" ? like.from_user_id : like.to_user_id))];
  const { data: rows } = ids.length ? await supabase.from("profiles").select("id,display_name,age,country,city,interests,bio,avatar_path,gender,locale").in("id", ids) : { data: [] };
  const photoUrls = await signedPhotoUrls(supabase, (rows ?? []).map((profile) => profile.avatar_path));
  const profiles: ProfileCardData[] = (rows ?? []).map((profile) => ({ ...profile, photo_url: profile.avatar_path ? photoUrls.get(profile.avatar_path) : undefined }));

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="likesTitle" /></span><h1><LocalizedPageText translationKey="likesTitle" /></h1><p><LocalizedPageText translationKey="likesIntro" /></p></div></div>
      <LocalizedNav className="segmented-tabs" translationKey="likesTitle"><Link href="/likes?view=received" className={view === "received" ? "active" : ""}><LocalizedPageText translationKey="received" /></Link><Link href="/likes?view=sent" className={view === "sent" ? "active" : ""}><LocalizedPageText translationKey="sent" /></Link></LocalizedNav>
      {params.updated && <p className="form-success" role="status"><LocalizedPageText translationKey="likesUpdated" /></p>}{params.error && <p className="form-error" role="alert"><LocalizedPageText translationKey="likesError" /></p>}
      {profiles.length ? <div className="profile-grid">{profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} variant={view === "sent" ? "sent-like" : "default"} />)}</div> : <div className="empty-state"><span className="empty-icon"><Heart size={22} /></span><h2><LocalizedPageText translationKey={view === "received" ? "receivedEmptyTitle" : "sentEmptyTitle"} /></h2><p><LocalizedPageText translationKey={view === "received" ? "receivedEmptyBody" : "sentEmptyBody"} /></p><Link className="button button-rose" href="/discover"><Sparkles size={15} /><LocalizedPageText translationKey="discoverMembers" /></Link></div>}
    </>
  );
}