import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Pencil, Sparkles } from "lucide-react";
import { AuthFeedback } from "@/components/auth-ui";
import { LocalizedPageText, LocalizedProfileEnum } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";
import { languages } from "@/lib/i18n";

export const metadata: Metadata = { title: "My profile" };

export default async function MyProfilePage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return <div className="empty-state"><h2><LocalizedPageText translationKey="profileStartTitle" /></h2><p><LocalizedPageText translationKey="profileStartBody" /></p></div>;
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
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="makeItYours" /></span><h1><LocalizedPageText translationKey="myProfile" /></h1><p><LocalizedPageText translationKey="profilePageIntro" /></p></div><Link className="button button-outline" href="/profile/edit"><Pencil size={15} /><LocalizedPageText translationKey="editProfile" /></Link></div>
      <AuthFeedback updated={params.updated === "1"} />
      <section className="own-profile-hero panel">
        <div className="own-avatar">{profile.avatar_path && photoUrls.get(profile.avatar_path) ? <Image src={photoUrls.get(profile.avatar_path)!} alt="" fill sizes="145px" /> : <span>{profile.display_name.slice(0, 1).toUpperCase()}</span>}</div>
        <div className="own-profile-info"><span className="eyebrow-small"><LocalizedPageText translationKey={profile.is_verified ? "verifiedMember" : "memberProfile"} /></span><h2>{profile.display_name}{profile.show_age && profile.age ? `, ${profile.age}` : ""}</h2><p><MapPin size={14} />{profile.show_city ? location || <LocalizedPageText translationKey="addLocation" /> : <LocalizedPageText translationKey="locationHidden" />}</p>{profile.bio && <div className="own-bio">{profile.bio}</div>}<div className="interest-pills">{interests.map((interest: string) => <span key={interest}>{interest}</span>)}</div></div>
        <div className="profile-stats"><span><strong>{likesCount ?? 0}</strong><LocalizedPageText translationKey="likes" /></span><span><strong>{visitorsCount ?? 0}</strong><LocalizedPageText translationKey="visits" /></span><Link href="/discover"><LocalizedPageText translationKey="previewDiscovery" /> <ArrowUpRight size={13} /></Link></div>
      </section>
      <div className="profile-detail-grid">
        <section className="panel profile-details"><div className="panel-title"><h2><LocalizedPageText translationKey="aboutYou" /></h2><Link href="/profile/edit"><LocalizedPageText translationKey="edit" /></Link></div><dl>
          <div><dt><LocalizedPageText translationKey="gender" /></dt><dd>{profile.gender ? <LocalizedProfileEnum value={profile.gender} kind="gender" /> : <LocalizedPageText translationKey="notAdded" />}</dd></div><div><dt><LocalizedPageText translationKey="relationshipStatusField" /></dt><dd>{profile.marital_status ? <LocalizedProfileEnum value={profile.marital_status} kind="relationship" /> : <LocalizedPageText translationKey="notAdded" />}</dd></div><div><dt><LocalizedPageText translationKey="work" /></dt><dd>{profile.occupation || <LocalizedPageText translationKey="notAdded" />}</dd></div><div><dt><LocalizedPageText translationKey="education" /></dt><dd>{profile.education || <LocalizedPageText translationKey="notAdded" />}</dd></div><div><dt><LocalizedPageText translationKey="profileLanguage" /></dt><dd>{languages.find(([code]) => code === profile.locale)?.[1] ?? profile.locale ?? <LocalizedPageText translationKey="notAdded" />}</dd></div>
        </dl></section>
        <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="hopingToMeet" /></h2><Link href="/profile/edit"><LocalizedPageText translationKey="edit" /></Link></div><p>{profile.looking_for || <LocalizedPageText translationKey="connectionPrompt" />}</p><div className="preference-list"><span><LocalizedPageText translationKey="agePreference" variables={{ min: String(profile.preferred_min_age ?? 18), max: String(profile.preferred_max_age ?? 120) }} /></span>{profile.preferred_country && <span>{profile.preferred_country}</span>}{profile.preferred_city && <span>{profile.preferred_city}</span>}{profile.preferred_language && <span>{profile.preferred_language}</span>}</div></section>
      </div>
      <section className="panel photo-gallery"><div className="panel-title"><h2><LocalizedPageText translationKey="yourPhotos" /></h2><Link href="/profile/edit"><LocalizedPageText translationKey="managePhotos" /></Link></div>{photos?.length ? <div className="photo-thumb-grid">{photos.map((photo) => <div className="photo-thumb" key={photo.id}>{photoUrls.get(photo.object_path) && <Image src={photoUrls.get(photo.object_path)!} alt="" fill sizes="(max-width: 700px) 28vw, 150px" />}{photo.is_primary && <span><LocalizedPageText translationKey="profilePhotoLabel" /></span>}</div>)}</div> : <div className="empty-state"><Sparkles size={21} /><h2><LocalizedPageText translationKey="addPhotoPrompt" /></h2><p><LocalizedPageText translationKey="photoOptional" /></p><Link className="button button-outline" href="/profile/edit"><LocalizedPageText translationKey="managePhotos" /></Link></div>}</section>
    </>
  );
}