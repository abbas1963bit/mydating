import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";

export const metadata: Metadata = { title: "Profile visitors" };

export default async function VisitorsPage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: visits } = await supabase.from("profile_visits").select("visitor_id,created_at").eq("visited_id", user.id).order("created_at", { ascending: false }).limit(100);
  const unique = new Map<string, string>();
  for (const visit of visits ?? []) if (!unique.has(visit.visitor_id)) unique.set(visit.visitor_id, visit.created_at);
  const ids = [...unique.keys()];
  const { data: rows } = ids.length ? await supabase.from("profiles").select("id,display_name,age,country,city,interests,bio,avatar_path,gender,locale").in("id", ids) : { data: [] };
  const photoUrls = await signedPhotoUrls(supabase, (rows ?? []).map((profile) => profile.avatar_path));
  const profiles: ProfileCardData[] = (rows ?? []).map((profile) => ({ ...profile, photo_url: profile.avatar_path ? photoUrls.get(profile.avatar_path) : undefined }));

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small">Who stopped by</span><h1>Profile visitors</h1><p>People who have recently viewed your profile appear here.</p></div></div>
      {profiles.length ? <div className="profile-grid">{profiles.map((profile) => <div key={profile.id} className="activity-profile"><ProfileCard profile={profile} /><span className="visit-date">Visited {new Date(unique.get(profile.id)!).toLocaleDateString()}</span></div>)}</div> : <div className="empty-state"><Eye size={23} /><h2>Your profile is ready for its first visit</h2><p>When another member views your profile, you will see them here.</p><Link className="button button-outline" href="/profile/edit">Add to your profile</Link></div>}
    </>
  );
}