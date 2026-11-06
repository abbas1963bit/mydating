import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { deleteProfilePhoto, saveProfile, updatePhotoVisibility, uploadProfilePhoto } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";
import { languages } from "@/lib/i18n";

export const metadata: Metadata = { title: "Edit your profile" };

const profileErrorText: Record<string, string> = {
  invalid: "Check the information you entered and try again.",
  "age-range": "The minimum preferred age must not exceed the maximum.",
  save: "Your profile could not be saved. Please try again.",
  "photo-size": "Choose an image smaller than 8 MB.",
  "photo-type": "Use a valid JPEG, PNG, or WebP image.",
  "photo-save": "The photo could not be saved. Please try again.",
  photo: "That photo could not be updated.",
};

export default async function EditProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; photo?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: photos } = await supabase.from("profile_photos").select("id,object_path,is_primary,visibility").eq("user_id", user.id).order("created_at", { ascending: false });
  const photoUrls = await signedPhotoUrls(supabase, (photos ?? []).map((photo) => photo.object_path));
  const listValue = (value: string[] | null) => value?.join(", ") ?? "";

  return (
    <>
      <div className="page-heading"><div><Link href="/profile" className="back-home"><ArrowLeft size={14} />My profile</Link><span className="eyebrow-small">Make it yours</span><h1>Edit your profile</h1><p>Your profile and photos are stored securely with your account.</p></div></div>
      {params.error && <p className="form-error" role="alert">{profileErrorText[params.error] ?? "Something went wrong. Please try again."}</p>}
      {params.photo && <p className="form-success" role="status">Your photo settings were saved.</p>}
      <form className="edit-profile-form" action={saveProfile}>
        <section className="panel"><div className="panel-title"><h2>About you</h2></div><div className="edit-grid">
          <div className="form-field"><label htmlFor="display_name">Name</label><input id="display_name" name="display_name" minLength={2} maxLength={60} defaultValue={profile?.display_name ?? ""} required /></div>
          <div className="form-field"><label htmlFor="age">Age</label><input id="age" name="age" type="number" min="18" max="120" defaultValue={profile?.age ?? ""} /></div>
          <div className="form-field"><label htmlFor="gender">Gender</label><select id="gender" name="gender" defaultValue={profile?.gender ?? ""}><option value="">Prefer not to say</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></div>
          <div className="form-field"><label htmlFor="marital_status">Relationship status</label><select id="marital_status" name="marital_status" defaultValue={profile?.marital_status ?? ""}><option value="">Choose one</option><option>Single</option><option>Divorced</option><option>Widowed</option><option>Separated</option></select></div>
          <div className="form-field"><label htmlFor="country">Country</label><input id="country" name="country" maxLength={100} defaultValue={profile?.country ?? ""} /></div>
          <div className="form-field"><label htmlFor="city">City</label><input id="city" name="city" maxLength={100} defaultValue={profile?.city ?? ""} /></div>
          <div className="form-field"><label htmlFor="locale">Your language</label><select id="locale" name="locale" defaultValue={profile?.locale ?? "en"}>{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div>
          <div className="form-field"><label htmlFor="occupation">Occupation</label><input id="occupation" name="occupation" maxLength={100} defaultValue={profile?.occupation ?? ""} /></div>
          <div className="form-field"><label htmlFor="education">Education</label><input id="education" name="education" maxLength={100} defaultValue={profile?.education ?? ""} /></div>
          <div className="form-field edit-wide"><label htmlFor="interests">Interests</label><input id="interests" name="interests" maxLength={1000} placeholder="Reading, cooking, hiking" defaultValue={listValue(profile?.interests)} /><span className="form-hint">Separate interests with commas.</span></div>
          <div className="form-field edit-wide"><label htmlFor="bio">About you</label><textarea id="bio" name="bio" maxLength={1200} placeholder="What do you enjoy talking about?" defaultValue={profile?.bio ?? ""} /></div>
          <div className="form-field edit-wide"><label htmlFor="looking_for">What you hope to find</label><textarea id="looking_for" name="looking_for" maxLength={800} placeholder="Describe the kind of connection you are looking for." defaultValue={profile?.looking_for ?? ""} /></div>
        </div></section>
        <section className="panel"><div className="panel-title"><h2>Preferences</h2></div><p className="form-hint">These preferences guide suggestions. They are not shown on your public profile.</p><div className="edit-grid">
          <div className="form-field"><label htmlFor="preferred_min_age">Minimum age</label><input id="preferred_min_age" name="preferred_min_age" type="number" min="18" max="120" defaultValue={profile?.preferred_min_age ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_max_age">Maximum age</label><input id="preferred_max_age" name="preferred_max_age" type="number" min="18" max="120" defaultValue={profile?.preferred_max_age ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_gender">Gender</label><select id="preferred_gender" name="preferred_gender" defaultValue={profile?.preferred_gender ?? ""}><option value="">Any</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Other</option></select></div>
          <div className="form-field"><label htmlFor="preferred_country">Country</label><input id="preferred_country" name="preferred_country" defaultValue={profile?.preferred_country ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_city">City</label><input id="preferred_city" name="preferred_city" defaultValue={profile?.preferred_city ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_language">Language</label><select id="preferred_language" name="preferred_language" defaultValue={profile?.preferred_language ?? ""}><option value="">Any language</option>{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div>
          <div className="form-field"><label htmlFor="preferred_interests">Preferred interests</label><input id="preferred_interests" name="preferred_interests" placeholder="Reading, cooking" defaultValue={listValue(profile?.preferred_interests)} /></div>
        </div></section>
        <section className="panel"><div className="panel-title"><h2>Privacy</h2></div><div className="form-field"><label htmlFor="visibility">Profile visibility</label><select id="visibility" name="visibility" defaultValue={profile?.visibility ?? "members"}><option value="public">Public</option><option value="members">Signed-in members</option><option value="private">Only me</option></select></div><label className="consent-row"><input type="checkbox" name="show_age" defaultChecked={profile?.show_age ?? true} />Show my age on my profile</label><label className="consent-row"><input type="checkbox" name="show_city" defaultChecked={profile?.show_city ?? true} />Show my city on my profile</label><button className="button button-rose" type="submit">Save profile</button></section>
      </form>
      <section className="panel photo-manager"><div className="panel-title"><h2>Profile photos</h2><span className="form-hint">JPEG, PNG, or WebP · up to 8 MB</span></div><form className="photo-upload" action={uploadProfilePhoto} encType="multipart/form-data"><label className="button button-outline" htmlFor="photo"><Upload size={15} />Choose a photo</label><input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required /><button className="button" type="submit">Upload photo</button></form>{photos?.length ? <div className="photo-manager-grid">{photos.map((photo) => <div className="photo-manage-row" key={photo.id}><div className="photo-manage-preview">{photoUrls.get(photo.object_path) && <Image src={photoUrls.get(photo.object_path)!} alt="Your uploaded profile photo" fill sizes="80px" />}</div><div className="photo-manage-info"><strong>{photo.is_primary ? "Profile photo" : "Additional photo"}</strong><form action={updatePhotoVisibility}><input type="hidden" name="photo_id" value={photo.id} /><select name="visibility" aria-label="Photo visibility" defaultValue={photo.visibility}><option value="public">Public</option><option value="members">Members</option><option value="private">Only me</option></select><button className="button button-outline button-small" type="submit">Save</button></form></div><form action={deleteProfilePhoto}><input type="hidden" name="photo_id" value={photo.id} /><button className="icon-button danger-icon" type="submit" aria-label="Delete photo" title="Delete photo"><Trash2 size={16} /></button></form></div>)}</div> : <p className="completion-note">You have not added any photos yet.</p>}</section>
    </>
  );
}