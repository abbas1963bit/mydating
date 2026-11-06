import Link from "next/link";
import { ArrowUpRight, Bell, Heart, MessageCircle, Sparkles, Users } from "lucide-react";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
import { LocalizedPageText } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";

export default async function MemberHomePage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ownProfile } = await supabase.from("profiles").select("display_name,interests,preferred_interests,preferred_min_age,preferred_max_age,preferred_gender,preferred_country,preferred_language,avatar_path,bio,age,country,city,gender,occupation,education").eq("id", user.id).maybeSingle();
  const interests = [...new Set([...(ownProfile?.interests ?? []), ...(ownProfile?.preferred_interests ?? [])])];
  let query = supabase.from("profiles").select("id,display_name,age,country,city,interests,bio,avatar_path,gender,locale").neq("id", user.id).eq("is_active", true).order("updated_at", { ascending: false }).limit(6);
  if (ownProfile?.preferred_min_age) query = query.gte("age", ownProfile.preferred_min_age);
  if (ownProfile?.preferred_max_age) query = query.lte("age", ownProfile.preferred_max_age);
  if (ownProfile?.preferred_gender) query = query.eq("gender", ownProfile.preferred_gender);
  if (ownProfile?.preferred_country) query = query.eq("country", ownProfile.preferred_country);
  if (ownProfile?.preferred_language) query = query.eq("locale", ownProfile.preferred_language);
  const { data: profiles } = await query;
  const photoUrls = await signedPhotoUrls(supabase, (profiles ?? []).map((profile) => profile.avatar_path));
  const suggestions: ProfileCardData[] = (profiles ?? []).map((profile) => {
    const shared = profile.interests?.filter((interest: string) => interests.includes(interest)).length ?? 0;
    const score = Math.min(98, 56 + shared * 9 + (profile.country && profile.country === ownProfile?.country ? 8 : 0));
    return { ...profile, compatibility: interests.length ? score : 64, photo_url: profile.avatar_path ? photoUrls.get(profile.avatar_path) : undefined };
  });
  const completionFields = [ownProfile?.display_name, ownProfile?.age, ownProfile?.country, ownProfile?.bio, ownProfile?.interests?.length, ownProfile?.avatar_path, ownProfile?.gender, ownProfile?.city];
  const completion = Math.round(completionFields.filter(Boolean).length / completionFields.length * 100);
  const [{ count: likeCount }, { count: messageCount }, { count: unreadCount }] = await Promise.all([
    supabase.from("likes").select("from_user_id", { count: "exact", head: true }).eq("to_user_id", user.id),
    supabase.from("conversations").select("id", { count: "exact", head: true }).or(`member_one.eq.${user.id},member_two.eq.${user.id}`),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
  ]);

  return (
    <>
      <section className="welcome-banner"><div><span className="eyebrow-small"><LocalizedPageText translationKey="homeEyebrow" /></span><h1>{ownProfile?.display_name ? <LocalizedPageText translationKey="welcomeName" variables={{ name: ownProfile.display_name.split(" ")[0] }} /> : <LocalizedPageText translationKey="welcomeDefault" />}</h1><p><LocalizedPageText translationKey="welcomeBody" /></p></div><Link className="button button-rose" href="/discover"><LocalizedPageText translationKey="explorePeople" /> <ArrowUpRight size={15} /></Link></section>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="panel-title"><h2><LocalizedPageText translationKey="suggestedPeople" /></h2><Link href="/discover"><LocalizedPageText translationKey="morePeople" /> <ArrowUpRight size={14} /></Link></div>
          {suggestions.length ? <div className="profile-grid">{suggestions.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}</div> : <div className="empty-state"><Users size={24} /><h2><LocalizedPageText translationKey="profileStartTitle" /></h2><p><LocalizedPageText translationKey="profileStartBody" /></p><Link className="button button-rose" href="/profile/edit"><LocalizedPageText translationKey="completeProfile" /> <ArrowUpRight size={14} /></Link></div>}
        </div>
        <aside className="dashboard-aside">
          <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="yourProfile" /></h2><Link href="/profile/edit"><LocalizedPageText translationKey="edit" /></Link></div><div className="completion-meter"><div><span><LocalizedPageText translationKey="profileCompletion" /></span><strong>{completion}%</strong></div><div className="meter-track"><span style={{ width: `${completion}%` }} /></div><span className="completion-note"><LocalizedPageText translationKey="completionTip" /></span></div></section>
          <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="yourActivity" /></h2><Link href="/notifications"><LocalizedPageText translationKey="seeAll" /></Link></div><div className="quick-link-list"><Link href="/likes"><Heart size={16} /><LocalizedPageText translationKey="likesReceived" /><span>{likeCount ?? 0}</span></Link><Link href="/messages"><MessageCircle size={16} /><LocalizedPageText translationKey="conversations" /><span>{messageCount ?? 0}</span></Link><Link href="/notifications"><Bell size={16} /><LocalizedPageText translationKey="newUpdates" /><span>{unreadCount ?? 0}</span></Link></div></section>
          <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="tryNext" /></h2><Sparkles size={16} color="var(--rose-deep)" /></div><p className="completion-note"><LocalizedPageText translationKey="nextTip" /></p><Link className="button button-outline" href="/profile/edit" style={{ width: "100%", marginTop: 12 }}><LocalizedPageText translationKey="addMoreAboutYou" /></Link></section>
        </aside>
      </div>
    </>
  );
}