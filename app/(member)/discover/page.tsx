import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
import { LocalizedInput, LocalizedPageText } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";

export const metadata: Metadata = { title: "Discover people" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase.from("profiles").select("id,display_name,age,country,city,interests,bio,avatar_path,gender,locale,marital_status").neq("id", user.id).eq("is_active", true).order("updated_at", { ascending: false }).limit(30);
  const q = value("q").trim().replace(/[%_*(),]/g, " ").slice(0, 60);
  const gender = value("gender").slice(0, 40);
  const country = value("country").trim().slice(0, 100);
  const city = value("city").trim().slice(0, 100);
  const language = value("language").slice(0, 20);
  const maritalStatus = value("marital_status").slice(0, 40);
  const minAge = Number(value("min_age"));
  const maxAge = Number(value("max_age"));
  const interests = value("interests").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 10);
  if (q) query = query.ilike("display_name", `%${q}%`);
  if (gender) query = query.eq("gender", gender);
  if (country) query = query.ilike("country", country);
  if (city) query = query.ilike("city", city);
  if (language) query = query.eq("locale", language);
  if (maritalStatus) query = query.eq("marital_status", maritalStatus);
  if (Number.isInteger(minAge) && minAge >= 18 && minAge <= 120) query = query.gte("age", minAge);
  if (Number.isInteger(maxAge) && maxAge >= 18 && maxAge <= 120) query = query.lte("age", maxAge);
  if (interests.length) query = query.overlaps("interests", interests);
  const { data: rows, error } = await query;
  const photoUrls = await signedPhotoUrls(supabase, (rows ?? []).map((profile) => profile.avatar_path));
  const results: ProfileCardData[] = (rows ?? []).map((profile) => ({ ...profile, photo_url: profile.avatar_path ? photoUrls.get(profile.avatar_path) : undefined }));

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="discoverEyebrow" /></span><h1><LocalizedPageText translationKey="discoverTitle" /></h1><p><LocalizedPageText translationKey="discoverBody" /></p></div></div>
      {params.error && <p className="form-error" role="alert"><LocalizedPageText translationKey="actionError" /></p>}
      {params.liked && <p className="form-success" role="status"><LocalizedPageText translationKey="likeSent" /></p>}
      {params.reported && <p className="form-success" role="status"><LocalizedPageText translationKey="reportSent" /></p>}
      <form className="search-panel" method="get">
        <div className="search-field search-wide"><label htmlFor="q"><LocalizedPageText translationKey="nameKeyword" /></label><LocalizedInput id="q" name="q" translationKey="namePlaceholder" defaultValue={value("q")} /></div>
        <div className="search-field"><label htmlFor="gender"><LocalizedPageText translationKey="gender" /></label><select id="gender" name="gender" defaultValue={value("gender")}><option value=""><LocalizedPageText translationKey="any" /></option><option value="Woman"><LocalizedPageText translationKey="woman" /></option><option value="Man"><LocalizedPageText translationKey="man" /></option><option value="Non-binary"><LocalizedPageText translationKey="nonBinary" /></option><option value="Other"><LocalizedPageText translationKey="other" /></option></select></div>
        <div className="search-field"><label htmlFor="country"><LocalizedPageText translationKey="country" /></label><LocalizedInput id="country" name="country" translationKey="anyCountry" defaultValue={value("country")} /></div>
        <div className="search-field"><label htmlFor="city"><LocalizedPageText translationKey="city" /></label><LocalizedInput id="city" name="city" translationKey="anyCity" defaultValue={value("city")} /></div>
        <div className="search-field"><label htmlFor="language"><LocalizedPageText translationKey="language" /></label><input id="language" name="language" placeholder="en, ar, zh-CN" defaultValue={value("language")} /></div>
        <div className="search-field"><label htmlFor="marital_status"><LocalizedPageText translationKey="relationshipStatus" /></label><select id="marital_status" name="marital_status" defaultValue={value("marital_status")}><option value=""><LocalizedPageText translationKey="any" /></option><option value="Single"><LocalizedPageText translationKey="single" /></option><option value="Divorced"><LocalizedPageText translationKey="divorced" /></option><option value="Widowed"><LocalizedPageText translationKey="widowed" /></option></select></div>
        <div className="search-field age-field"><label><LocalizedPageText translationKey="ageRange" /></label><div><LocalizedInput name="min_age" type="number" min="18" max="120" placeholder="18" defaultValue={value("min_age")} ariaTranslationKey="minimumAge" /><span>–</span><LocalizedInput name="max_age" type="number" min="18" max="120" placeholder="120" defaultValue={value("max_age")} ariaTranslationKey="maximumAge" /></div></div>
        <div className="search-field"><label htmlFor="interests"><LocalizedPageText translationKey="interests" /></label><LocalizedInput id="interests" name="interests" translationKey="interestsExample" defaultValue={value("interests")} /></div>
        <button className="button button-rose search-submit" type="submit"><Search size={16} /><LocalizedPageText translationKey="searchPeople" /></button>
      </form>
      <div className="results-heading"><h2>{results.length ? <LocalizedPageText translationKey="resultCount" variables={{ count: String(results.length) }} /> : <LocalizedPageText translationKey="yourSearch" />}</h2><span><LocalizedPageText translationKey="activeProfiles" /></span></div>
      {error ? <div className="empty-state"><h2><LocalizedPageText translationKey="searchUnavailable" /></h2><p><LocalizedPageText translationKey="tryAgain" /></p></div> : results.length ? <div className="profile-grid">{results.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}</div> : <div className="empty-state"><Search size={23} /><h2><LocalizedPageText translationKey="noMatches" /></h2><p><LocalizedPageText translationKey="widenSearch" /></p><a className="button button-outline" href="/discover"><LocalizedPageText translationKey="clearFilters" /></a></div>}
    </>
  );
}