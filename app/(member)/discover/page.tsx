import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ProfileCard, type ProfileCardData } from "@/components/profile-card";
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
      <div className="page-heading"><div><span className="eyebrow-small">Find your kind of person</span><h1>Discover</h1><p>Use the details that matter to you. You can change them whenever you like.</p></div></div>
      {params.error && <p className="form-error" role="alert">That action could not be completed. Please try again.</p>}
      {params.liked && <p className="form-success" role="status">Interest sent. See received likes in your Likes list.</p>}
      {params.reported && <p className="form-success" role="status">Thanks for helping keep the community thoughtful. Your report was sent for review.</p>}
      <form className="search-panel" method="get">
        <div className="search-field search-wide"><label htmlFor="q">Name or keyword</label><input id="q" name="q" placeholder="Try a name or something they love" defaultValue={value("q")} /></div>
        <div className="search-field"><label htmlFor="gender">Gender</label><select id="gender" name="gender" defaultValue={value("gender")}><option value="">Any</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></div>
        <div className="search-field"><label htmlFor="country">Country</label><input id="country" name="country" placeholder="Any country" defaultValue={value("country")} /></div>
        <div className="search-field"><label htmlFor="city">City</label><input id="city" name="city" placeholder="Any city" defaultValue={value("city")} /></div>
        <div className="search-field"><label htmlFor="language">Language</label><input id="language" name="language" placeholder="e.g. en, ar" defaultValue={value("language")} /></div>
        <div className="search-field"><label htmlFor="marital_status">Relationship status</label><select id="marital_status" name="marital_status" defaultValue={value("marital_status")}><option value="">Any</option><option>Single</option><option>Divorced</option><option>Widowed</option></select></div>
        <div className="search-field age-field"><label>Age range</label><div><input aria-label="Minimum age" name="min_age" type="number" min="18" max="120" placeholder="18" defaultValue={value("min_age")} /><span>to</span><input aria-label="Maximum age" name="max_age" type="number" min="18" max="120" placeholder="120" defaultValue={value("max_age")} /></div></div>
        <div className="search-field"><label htmlFor="interests">Interests</label><input id="interests" name="interests" placeholder="Reading, travel" defaultValue={value("interests")} /></div>
        <button className="button button-rose search-submit" type="submit"><Search size={16} />Search people</button>
      </form>
      <div className="results-heading"><h2>{results.length ? `${results.length} ${results.length === 1 ? "person" : "people"} to explore` : "Your search"}</h2><span>Showing active profiles</span></div>
      {error ? <div className="empty-state"><h2>Search is temporarily unavailable</h2><p>Please try again shortly.</p></div> : results.length ? <div className="profile-grid">{results.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}</div> : <div className="empty-state"><Search size={23} /><h2>No profiles match these filters yet</h2><p>Try widening your search, or check back as more people join.</p><a className="button button-outline" href="/discover">Clear filters</a></div>}
    </>
  );
}