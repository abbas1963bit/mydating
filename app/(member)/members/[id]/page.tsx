import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ban, Flag, Heart, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { blockUser, likeUser, reportUser, startConversation } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";
import { LocalizedPageText, LocalizedProfileEnum } from "@/components/language-provider";
import { languages } from "@/lib/i18n";

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
      <Link href="/discover" className="back-home"><ArrowLeft size={14} /><LocalizedPageText translationKey="backToDiscover" /></Link>
      <article className="member-profile-page">
        <section className="member-profile-head panel">
          <div className="member-profile-photos">
            {photos?.length ? photos.map((photo) => <div className="member-profile-photo" key={photo.id}>{photoUrls.get(photo.object_path) && <Image src={photoUrls.get(photo.object_path)!} alt={`${profile.display_name}'s photo`} fill sizes="(max-width: 700px) 80vw, 260px" />}</div>) : <div className="member-profile-photo member-profile-empty">{profile.display_name.slice(0, 1).toUpperCase()}</div>}
          </div>
          <div className="member-profile-summary"><span className="eyebrow-small"><LocalizedPageText translationKey={profile.is_verified ? "verified" : "memberLabel"} /></span><h1>{profile.display_name}{profile.show_age && profile.age ? `, ${profile.age}` : ""}</h1><p className="member-location"><MapPin size={15} />{profile.show_city ? location || <LocalizedPageText translationKey="locationNotShared" /> : profile.country ?? <LocalizedPageText translationKey="locationNotShared" />}</p><p className="member-profile-about">{profile.bio || <LocalizedPageText translationKey="memberBioEmpty" />}</p><div className="profile-actions-large">
            {user.id !== id && <><form action={startConversation}><input type="hidden" name="user_id" value={id} /><button className="button button-rose" type="submit"><MessageCircle size={16} /><LocalizedPageText translationKey="sayHello" /></button></form><form action={likeUser}><input type="hidden" name="user_id" value={id} /><button className="button button-outline" type="submit"><Heart size={16} fill={like ? "currentColor" : "none"} /><LocalizedPageText translationKey={like ? "liked" : "sendInterest"} /></button></form></>}
          </div></div>
        </section>
        <div className="member-profile-detail-grid">
          <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="aboutMember" variables={{ name: profile.display_name }} /></h2></div><dl className="profile-detail-list"><div><dt><LocalizedPageText translationKey="gender" /></dt><dd>{profile.gender ? <LocalizedProfileEnum value={profile.gender} kind="gender" /> : <LocalizedPageText translationKey="notShared" />}</dd></div><div><dt><LocalizedPageText translationKey="relationshipStatusField" /></dt><dd>{profile.marital_status ? <LocalizedProfileEnum value={profile.marital_status} kind="relationship" /> : <LocalizedPageText translationKey="notShared" />}</dd></div><div><dt><LocalizedPageText translationKey="work" /></dt><dd>{profile.occupation || <LocalizedPageText translationKey="notShared" />}</dd></div><div><dt><LocalizedPageText translationKey="education" /></dt><dd>{profile.education || <LocalizedPageText translationKey="notShared" />}</dd></div><div><dt><LocalizedPageText translationKey="profileLanguage" /></dt><dd>{languages.find(([code]) => code === profile.locale)?.[1] ?? profile.locale ?? <LocalizedPageText translationKey="notShared" />}</dd></div></dl><h3 className="small-heading"><LocalizedPageText translationKey="interestsHeading" /></h3><div className="interest-pills">{profile.interests?.length ? profile.interests.map((interest: string) => <span key={interest}>{interest}</span>) : <span><LocalizedPageText translationKey="notShared" /></span>}</div></section>
          <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="lookingFor" /></h2></div><p>{profile.looking_for || <LocalizedPageText translationKey="lookingForMemberEmpty" />}</p></section>
        </div>
        {user.id !== id && <details className="safety-menu panel"><summary><ShieldCheck size={16} /><LocalizedPageText translationKey="safetyHeading" /></summary><div className="safety-actions"><form action={blockUser}><input type="hidden" name="user_id" value={id} /><button className="button button-outline" type="submit"><Ban size={15} /><LocalizedPageText translationKey="blockMember" /></button></form><form action={reportUser} className="report-form"><input type="hidden" name="user_id" value={id} /><label htmlFor="reason"><LocalizedPageText translationKey="reportThisProfile" /></label><select id="reason" name="reason" required><option value=""><LocalizedPageText translationKey="chooseReason" /></option><option value="fake_profile"><LocalizedPageText translationKey="fakeProfile" /></option><option value="harassment"><LocalizedPageText translationKey="harassment" /></option><option value="spam"><LocalizedPageText translationKey="spam" /></option><option value="underage"><LocalizedPageText translationKey="underage" /></option><option value="inappropriate_content"><LocalizedPageText translationKey="inappropriate" /></option><option value="other"><LocalizedPageText translationKey="reasonOther" /></option></select><label className="sr-only" htmlFor="report-details"><LocalizedPageText translationKey="reportDetails" /></label><textarea id="report-details" name="details" maxLength={1500} placeholder="" /><button className="button button-outline" type="submit"><Flag size={15} /><LocalizedPageText translationKey="submitReport" /></button></form></div></details>}
      </article>
    </>
  );
}