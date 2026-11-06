import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ban, Flag, Heart, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { blockUser, likeUser, reportUser, startConversation } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";

export const metadata: Metadata = { title: "Member profile" };

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { data: profile } = await supabase.from("profiles").select("id,display_name,age,gender,country,city,locale,marital_status,occupation,education,interests,bio,looking_for,avatar_path,show_age,show_city,is_verified").eq("id", id).maybeSingle();
  if (!profile) notFound();
  if (user.id !== id) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentVisit } = await supabase.from("profile_visits").select("id").eq("visitor_id", user.id).eq("visited_id", id).gte("created_at", cutoff).limit(1).maybeSingle();
    if (!recentVisit) await supabase.from("profile_visits").insert({ visitor_id: user.id, visited_id: id });
  }
  const [{ data: photos }, { data: like }] = await Promise.all([
    supabase.from("profile_photos").select("id,object_path,is_primary,visibility").eq("user_id", id).order("is_primary", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("likes").select("from_user_id").eq("from_user_id", user.id).eq("to_user_id", id).maybeSingle(),
  ]);
  const photoPaths = (photos ?? []).map((photo) => photo.object_path);
  const photoUrls = await signedPhotoUrls(supabase, photoPaths);
  const location = [profile.show_city ? profile.city : null, profile.country].filter(Boolean).join(", ");

  return (
    <>
      <Link href="/discover" className="back-home"><ArrowLeft size={14} />Back to discover</Link>
      <article className="member-profile-page">
        <section className="member-profile-head panel">
          <div className="member-profile-photos">
            {photos?.length ? photos.map((photo) => <div className="member-profile-photo" key={photo.id}>{photoUrls.get(photo.object_path) && <Image src={photoUrls.get(photo.object_path)!} alt={`${profile.display_name}'s photo`} fill sizes="(max-width: 700px) 80vw, 260px" />}</div>) : <div className="member-profile-photo member-profile-empty">{profile.display_name.slice(0, 1).toUpperCase()}</div>}
          </div>
          <div className="member-profile-summary"><span className="eyebrow-small">{profile.is_verified ? "Verified member" : "WeDating member"}</span><h1>{profile.display_name}{profile.show_age && profile.age ? `, ${profile.age}` : ""}</h1><p className="member-location"><MapPin size={15} />{profile.show_city ? location || "Location not shared" : profile.country ?? "Location not shared"}</p><p className="member-profile-about">{profile.bio || "This member has not added an introduction yet."}</p><div className="profile-actions-large">
            {user.id !== id && <><form action={startConversation}><input type="hidden" name="user_id" value={id} /><button className="button button-rose" type="submit"><MessageCircle size={16} />Say hello</button></form><form action={likeUser}><input type="hidden" name="user_id" value={id} /><button className="button button-outline" type="submit"><Heart size={16} fill={like ? "currentColor" : "none"} />{like ? "Liked" : "Send interest"}</button></form></>}
          </div></div>
        </section>
        <div className="member-profile-detail-grid">
          <section className="panel"><div className="panel-title"><h2>A little more about {profile.display_name}</h2></div><dl className="profile-detail-list"><div><dt>Gender</dt><dd>{profile.gender || "Not shared"}</dd></div><div><dt>Relationship status</dt><dd>{profile.marital_status || "Not shared"}</dd></div><div><dt>Work</dt><dd>{profile.occupation || "Not shared"}</dd></div><div><dt>Education</dt><dd>{profile.education || "Not shared"}</dd></div><div><dt>Language</dt><dd>{profile.locale || "Not shared"}</dd></div></dl><h3 className="small-heading">Interests</h3><div className="interest-pills">{profile.interests?.length ? profile.interests.map((interest: string) => <span key={interest}>{interest}</span>) : <span>Not shared</span>}</div></section>
          <section className="panel"><div className="panel-title"><h2>Looking for</h2></div><p>{profile.looking_for || "They have not added what they are looking for yet."}</p></section>
        </div>
        {user.id !== id && <details className="safety-menu panel"><summary><ShieldCheck size={16} />Your comfort and safety</summary><div className="safety-actions"><form action={blockUser}><input type="hidden" name="user_id" value={id} /><button className="button button-outline" type="submit"><Ban size={15} />Block this member</button></form><form action={reportUser} className="report-form"><input type="hidden" name="user_id" value={id} /><label htmlFor="reason">Report this profile</label><select id="reason" name="reason" required><option value="">Choose a reason</option><option value="fake_profile">Fake profile</option><option value="harassment">Harassment</option><option value="spam">Spam</option><option value="underage">Underage user</option><option value="inappropriate_content">Inappropriate content</option><option value="other">Other</option></select><textarea name="details" maxLength={1500} placeholder="Optional details" /><button className="button button-outline" type="submit"><Flag size={15} />Submit report</button></form></div></details>}
      </article>
    </>
  );
}