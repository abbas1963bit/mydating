import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Pencil, Sparkles } from "lucide-react";
import { AuthFeedback } from "@/components/auth-ui";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";

export const metadata: Metadata = { title: "My profile" };

export default async function MyProfilePage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return <div className="empty-state"><h2>Your profile is not ready yet</h2><p>Finish setting up your account and try again.</p></div>;
  const [{ data: photos }, { count: likesCount }, { count: visitorsCount }] = await Promise.all([
    supabase.from("profile_photos").select("id,object_path,is_primary,visibility,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("likes").select("from_user_id", { count: "exact", head: true }).eq("to_user_id", user.id),
    supabase.from("profile_visits").select("id", { count: "exact", head: true }).eq("visited_id", user.id),
  ]);
  const photoUrls = await signedPhotoUrls(supabase, [profile.avatar_path, ...(photos ?? []).map((photo) => photo.object_path)]);
  const interests = profile.interests ?? [];
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small">Your story, your way</span><h1>My profile</h1><p>Keep the details that feel like you. You control what others can see.</p></div><Link className="button button-outline" href="/profile/edit"><Pencil size={15} />Edit profile</Link></div>
      <AuthFeedback updated={params.updated === "1"} />
      <section className="own-profile-hero panel">
        <div className="own-avatar">{profile.avatar_path && photoUrls.get(profile.avatar_path) ? <Image src={photoUrls.get(profile.avatar_path)!} alt="Your profile photo" fill sizes="145px" /> : <span>{profile.display_name.slice(0, 1).toUpperCase()}</span>}</div>
        <div className="own-profile-info"><span className="eyebrow-small">{profile.is_verified ? "Verified member" : "Member profile"}</span><h2>{profile.display_name}{profile.show_age && profile.age ? `, ${profile.age}` : ""}</h2><p><MapPin size={14} />{profile.show_city ? location || "Add your location" : "Location hidden"}</p>{profile.bio && <div className="own-bio">{profile.bio}</div>}<div className="interest-pills">{interests.map((interest: string) => <span key={interest}>{interest}</span>)}</div></div>
        <div className="profile-stats"><span><strong>{likesCount ?? 0}</strong>Likes</span><span><strong>{visitorsCount ?? 0}</strong>Visits</span><Link href="/discover">Preview discovery <ArrowUpRight size={13} /></Link></div>
      </section>
      <div className="profile-detail-grid">
        <section className="panel profile-details"><div className="panel-title"><h2>About you</h2><Link href="/profile/edit">Edit</Link></div><dl>
          <div><dt>Gender</dt><dd>{profile.gender || "Not added"}</dd></div><div><dt>Relationship status</dt><dd>{profile.marital_status || "Not added"}</dd></div><div><dt>Work</dt><dd>{profile.occupation || "Not added"}</dd></div><div><dt>Education</dt><dd>{profile.education || "Not added"}</dd></div><div><dt>Language</dt><dd>{profile.locale || "Not added"}</dd></div>
        </dl></section>
        <section className="panel"><div className="panel-title"><h2>Hoping to meet</h2><Link href="/profile/edit">Edit</Link></div><p>{profile.looking_for || "Share what kind of connection you are looking for."}</p><div className="preference-list"><span>Age {profile.preferred_min_age ?? "18"}–{profile.preferred_max_age ?? "120"}</span>{profile.preferred_country && <span>{profile.preferred_country}</span>}{profile.preferred_city && <span>{profile.preferred_city}</span>}{profile.preferred_language && <span>{profile.preferred_language}</span>}</div></section>
      </div>
      <section className="panel photo-gallery"><div className="panel-title"><h2>Your photos</h2><Link href="/profile/edit">Manage photos</Link></div>{photos?.length ? <div className="photo-thumb-grid">{photos.map((photo) => <div className="photo-thumb" key={photo.id}>{photoUrls.get(photo.object_path) && <Image src={photoUrls.get(photo.object_path)!} alt="Profile gallery photo" fill sizes="(max-width: 700px) 28vw, 150px" />}{photo.is_primary && <span>Profile photo</span>}</div>)}</div> : <div className="empty-state"><Sparkles size={21} /><h2>Add a photo that feels like you</h2><p>Photos are optional. You can decide who sees them.</p><Link className="button button-outline" href="/profile/edit">Manage photos</Link></div>}</section>
    </>
  );
}