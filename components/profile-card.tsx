import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { likeUser, startConversation, unlikeUser } from "@/app/actions/members";

export type ProfileCardData = {
  id: string;
  display_name: string;
  age: number | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  avatar_path: string | null;
  gender?: string | null;
  locale?: string | null;
  compatibility?: number;
  photo_url?: string;
};

export function ProfileCard({ profile, variant = "default" }: Readonly<{ profile: ProfileCardData; variant?: "default" | "sent-like" }>) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  return (
    <article className="profile-card">
      <Link href={`/members/${profile.id}`} className="profile-card-media" aria-label={`View ${profile.display_name}'s profile`}>
        {profile.photo_url ? <Image src={profile.photo_url} alt={`${profile.display_name}'s profile`} fill sizes="(max-width: 430px) 90vw, (max-width: 1050px) 42vw, 26vw" /> : <span className="avatar-fallback">{profile.display_name.slice(0, 1).toUpperCase()}</span>}
        <div className="profile-card-overlay"><h3>{profile.display_name}{profile.age && `, ${profile.age}`}</h3><p><MapPin size={12} />{location || "Location not shared"}</p></div>
        {typeof profile.compatibility === "number" && <span className="compatibility-badge"><Sparkles size={12} />{profile.compatibility}% match</span>}
      </Link>
      <div className="profile-card-body">
        <p>{profile.bio?.trim() || (profile.interests?.length ? profile.interests.slice(0, 3).join(" · ") : "Still writing their introduction.")}</p>
        <div className="profile-card-actions">
          {variant === "sent-like" ? <form action={unlikeUser}><input type="hidden" name="user_id" value={profile.id} /><button className="button button-outline" type="submit">Remove like</button></form> : <form action={likeUser}><input type="hidden" name="user_id" value={profile.id} /><button className="button button-rose" type="submit"><Heart size={14} />Like</button></form>}
          <form action={startConversation}><input type="hidden" name="user_id" value={profile.id} /><button className="button button-outline" type="submit"><MessageCircle size={14} />Message</button></form>
        </div>
      </div>
    </article>
  );
}