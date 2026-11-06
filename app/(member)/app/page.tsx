import Link from "next/link";
import { ArrowUpRight, Bell, Heart, MessageCircle, Sparkles, Users } from "lucide-react";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
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
      <section className="welcome-banner"><div><span className="eyebrow-small">Your next chapter</span><h1>Good to see you, {ownProfile?.display_name?.split(" ")[0] ?? "there"}.</h1><p>Take a look around. Someone interesting might be one hello away.</p></div><Link className="button button-rose" href="/discover">Explore people <ArrowUpRight size={15} /></Link></section>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="panel-title"><h2>People you might connect with</h2><Link href="/discover">More people <ArrowUpRight size={14} /></Link></div>
          {suggestions.length ? <div className="profile-grid">{suggestions.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}</div> : <div className="empty-state"><Users size={24} /><h2>Your discovery starts with a profile</h2><p>Add a few details about yourself and the people you hope to meet. Your suggestions get more thoughtful as you do.</p><Link className="button button-rose" href="/profile/edit">Complete your profile <ArrowUpRight size={14} /></Link></div>}
        </div>
        <aside className="dashboard-aside">
          <section className="panel"><div className="panel-title"><h2>Your profile</h2><Link href="/profile/edit">Edit</Link></div><div className="completion-meter"><div><span>Profile completion</span><strong>{completion}%</strong></div><div className="meter-track"><span style={{ width: `${completion}%` }} /></div><span className="completion-note">A little more about you helps the right person find you.</span></div></section>
          <section className="panel"><div className="panel-title"><h2>Your activity</h2><Link href="/notifications">See all</Link></div><div className="quick-link-list"><Link href="/likes"><Heart size={16} />Likes received<span>{likeCount ?? 0}</span></Link><Link href="/messages"><MessageCircle size={16} />Conversations<span>{messageCount ?? 0}</span></Link><Link href="/notifications"><Bell size={16} />New updates<span>{unreadCount ?? 0}</span></Link></div></section>
          <section className="panel"><div className="panel-title"><h2>Try this next</h2><Sparkles size={16} color="var(--rose-deep)" /></div><p className="completion-note">A specific introduction gives people something easy to start a conversation about.</p><Link className="button button-outline" href="/profile/edit" style={{ width: "100%", marginTop: 12 }}>Add a little more about you</Link></section>
        </aside>
      </div>
    </>
  );
}