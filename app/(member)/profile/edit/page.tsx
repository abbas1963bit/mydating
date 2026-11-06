import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { deleteProfilePhoto, saveProfile, updatePhotoVisibility, uploadProfilePhoto } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";
import { languages } from "@/lib/i18n";
import { LocalizedIconButton, LocalizedPageText, LocalizedText } from "@/components/language-provider";

export const metadata: Metadata = { title: "Edit your profile" };

const profileErrorKeys: Record<string, "profileInvalid" | "ageRangeError" | "profileSaveError" | "photoSizeError" | "photoTypeError" | "photoUploadError" | "photoUpdateError"> = {
  invalid: "profileInvalid",
  "age-range": "ageRangeError",
  save: "profileSaveError",
  "photo-size": "photoSizeError",
  "photo-type": "photoTypeError",
  "photo-save": "photoUploadError",
  photo: "photoUpdateError",
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
      <div className="page-heading"><div><Link href="/profile" className="back-home"><ArrowLeft size={14} /><LocalizedPageText translationKey="myProfile" /></Link><span className="eyebrow-small"><LocalizedPageText translationKey="makeItYours" /></span><h1><LocalizedPageText translationKey="editProfileTitle" /></h1><p><LocalizedPageText translationKey="profileStorageHint" /></p></div></div>
      {params.error && <p className="form-error" role="alert"><LocalizedPageText translationKey={profileErrorKeys[params.error] ?? "profileSaveError"} /></p>}
      {params.photo && <p className="form-success" role="status"><LocalizedPageText translationKey="photoSettingsSaved" /></p>}
      <form className="edit-profile-form" action={saveProfile}>
        <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="aboutYou" /></h2></div><div className="edit-grid">
          <div className="form-field"><label htmlFor="display_name">{<LocalizedText translationKey="name" />}</label><input id="display_name" name="display_name" minLength={2} maxLength={60} defaultValue={profile?.display_name ?? ""} required /></div>
          <div className="form-field"><label htmlFor="age"><LocalizedPageText translationKey="age" /></label><input id="age" name="age" type="number" min="18" max="120" defaultValue={profile?.age ?? ""} /></div>
          <div className="form-field"><label htmlFor="gender"><LocalizedPageText translationKey="gender" /></label><select id="gender" name="gender" defaultValue={profile?.gender ?? ""}><option value=""><LocalizedPageText translationKey="preferNotToSay" /></option><option value="Woman"><LocalizedPageText translationKey="woman" /></option><option value="Man"><LocalizedPageText translationKey="man" /></option><option value="Non-binary"><LocalizedPageText translationKey="nonBinary" /></option><option value="Other"><LocalizedPageText translationKey="other" /></option></select></div>
          <div className="form-field"><label htmlFor="marital_status"><LocalizedPageText translationKey="relationshipStatusField" /></label><select id="marital_status" name="marital_status" defaultValue={profile?.marital_status ?? ""}><option value=""><LocalizedPageText translationKey="chooseOne" /></option><option value="Single"><LocalizedPageText translationKey="single" /></option><option value="Divorced"><LocalizedPageText translationKey="divorced" /></option><option value="Widowed"><LocalizedPageText translationKey="widowed" /></option><option value="Separated"><LocalizedPageText translationKey="separated" /></option></select></div>
          <div className="form-field"><label htmlFor="country"><LocalizedPageText translationKey="country" /></label><input id="country" name="country" maxLength={100} defaultValue={profile?.country ?? ""} /></div>
          <div className="form-field"><label htmlFor="city"><LocalizedPageText translationKey="city" /></label><input id="city" name="city" maxLength={100} defaultValue={profile?.city ?? ""} /></div>
          <div className="form-field"><label htmlFor="locale"><LocalizedPageText translationKey="yourLanguage" /></label><select id="locale" name="locale" defaultValue={profile?.locale ?? "en"}>{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div>
          <div className="form-field"><label htmlFor="occupation"><LocalizedPageText translationKey="occupation" /></label><input id="occupation" name="occupation" maxLength={100} defaultValue={profile?.occupation ?? ""} /></div>
          <div className="form-field"><label htmlFor="education"><LocalizedPageText translationKey="education" /></label><input id="education" name="education" maxLength={100} defaultValue={profile?.education ?? ""} /></div>
          <div className="form-field edit-wide"><label htmlFor="interests"><LocalizedPageText translationKey="interestsHeading" /></label><input id="interests" name="interests" maxLength={1000} defaultValue={listValue(profile?.interests)} /><span className="form-hint"><LocalizedPageText translationKey="interestsHelp" /></span></div>
          <div className="form-field edit-wide"><label htmlFor="bio"><LocalizedPageText translationKey="aboutYourself" /></label><textarea id="bio" name="bio" maxLength={1200} defaultValue={profile?.bio ?? ""} /></div>
          <div className="form-field edit-wide"><label htmlFor="looking_for"><LocalizedPageText translationKey="whatYouSeek" /></label><textarea id="looking_for" name="looking_for" maxLength={800} defaultValue={profile?.looking_for ?? ""} /></div>
        </div></section>
        <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="preferences" /></h2></div><p className="form-hint"><LocalizedPageText translationKey="preferencesHint" /></p><div className="edit-grid">
          <div className="form-field"><label htmlFor="preferred_min_age"><LocalizedPageText translationKey="minAge" /></label><input id="preferred_min_age" name="preferred_min_age" type="number" min="18" max="120" defaultValue={profile?.preferred_min_age ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_max_age"><LocalizedPageText translationKey="maxAge" /></label><input id="preferred_max_age" name="preferred_max_age" type="number" min="18" max="120" defaultValue={profile?.preferred_max_age ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_gender"><LocalizedPageText translationKey="gender" /></label><select id="preferred_gender" name="preferred_gender" defaultValue={profile?.preferred_gender ?? ""}><option value=""><LocalizedPageText translationKey="any" /></option><option value="Woman"><LocalizedPageText translationKey="woman" /></option><option value="Man"><LocalizedPageText translationKey="man" /></option><option value="Non-binary"><LocalizedPageText translationKey="nonBinary" /></option><option value="Other"><LocalizedPageText translationKey="other" /></option></select></div>
          <div className="form-field"><label htmlFor="preferred_country"><LocalizedPageText translationKey="country" /></label><input id="preferred_country" name="preferred_country" defaultValue={profile?.preferred_country ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_city"><LocalizedPageText translationKey="city" /></label><input id="preferred_city" name="preferred_city" defaultValue={profile?.preferred_city ?? ""} /></div>
          <div className="form-field"><label htmlFor="preferred_language"><LocalizedPageText translationKey="language" /></label><select id="preferred_language" name="preferred_language" defaultValue={profile?.preferred_language ?? ""}><option value=""><LocalizedPageText translationKey="anyLanguage" /></option>{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></div>
          <div className="form-field"><label htmlFor="preferred_interests"><LocalizedPageText translationKey="preferredInterests" /></label><input id="preferred_interests" name="preferred_interests" defaultValue={listValue(profile?.preferred_interests)} /></div>
        </div></section>
        <section className="panel"><div className="panel-title"><h2><LocalizedPageText translationKey="privacy" /></h2></div><div className="form-field"><label htmlFor="visibility"><LocalizedPageText translationKey="profileVisibility" /></label><select id="visibility" name="visibility" defaultValue={profile?.visibility ?? "members"}><option value="public"><LocalizedPageText translationKey="public" /></option><option value="members"><LocalizedPageText translationKey="membersOnly" /></option><option value="private"><LocalizedPageText translationKey="onlyMe" /></option></select></div><label className="consent-row"><input type="checkbox" name="show_age" defaultChecked={profile?.show_age ?? true} /><LocalizedPageText translationKey="showAge" /></label><label className="consent-row"><input type="checkbox" name="show_city" defaultChecked={profile?.show_city ?? true} /><LocalizedPageText translationKey="showCity" /></label><button className="button button-rose" type="submit"><LocalizedPageText translationKey="saveProfile" /></button></section>
      </form>
      <section className="panel photo-manager"><div className="panel-title"><h2><LocalizedPageText translationKey="profilePhotos" /></h2><span className="form-hint"><LocalizedPageText translationKey="photoTypes" /></span></div><form className="photo-upload" action={uploadProfilePhoto} encType="multipart/form-data"><label className="button button-outline" htmlFor="photo"><Upload size={15} /><LocalizedPageText translationKey="choosePhoto" /></label><input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required /><button className="button" type="submit"><LocalizedPageText translationKey="uploadPhoto" /></button></form>{photos?.length ? <div className="photo-manager-grid">{photos.map((photo) => <div className="photo-manage-row" key={photo.id}><div className="photo-manage-preview">{photoUrls.get(photo.object_path) && <Image src={photoUrls.get(photo.object_path)!} alt="" fill sizes="80px" />}</div><div className="photo-manage-info"><strong>{photo.is_primary ? <LocalizedPageText translationKey="profilePhotoLabel" /> : <LocalizedPageText translationKey="additionalPhoto" />}</strong><form action={updatePhotoVisibility}><input type="hidden" name="photo_id" value={photo.id} /><label className="sr-only" htmlFor={`photo-visibility-${photo.id}`}><LocalizedPageText translationKey="photoVisibility" /></label><select id={`photo-visibility-${photo.id}`} name="visibility" defaultValue={photo.visibility}><option value="public"><LocalizedPageText translationKey="public" /></option><option value="members"><LocalizedPageText translationKey="membersOnly" /></option><option value="private"><LocalizedPageText translationKey="onlyMe" /></option></select><button className="button button-outline button-small" type="submit"><LocalizedPageText translationKey="save" /></button></form></div><form action={deleteProfilePhoto}><input type="hidden" name="photo_id" value={photo.id} /><LocalizedIconButton className="icon-button danger-icon" type="submit" translationKey="deletePhoto"><Trash2 size={16} /></LocalizedIconButton></form></div>)}</div> : <p className="completion-note"><LocalizedPageText translationKey="noPhotosYet" /></p>}</section>
    </>
  );
}