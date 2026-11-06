import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";
import { LocalizedDate, LocalizedPageText, LocalizedUnreadIndicator } from "@/components/language-provider";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: conversations } = await supabase.from("conversations").select("id,member_one,member_two,last_message_at").or(`member_one.eq.${user.id},member_two.eq.${user.id}`).order("last_message_at", { ascending: false }).limit(50);
  const conversationIds = (conversations ?? []).map((conversation) => conversation.id);
  const memberIds = [...new Set((conversations ?? []).map((conversation) => conversation.member_one === user.id ? conversation.member_two : conversation.member_one))];
  const [{ data: profiles }, { data: messages }] = await Promise.all([
    memberIds.length ? supabase.from("profiles").select("id,display_name,avatar_path,is_verified").in("id", memberIds) : Promise.resolve({ data: [] }),
    conversationIds.length ? supabase.from("messages").select("conversation_id,sender_id,body,created_at,read_at").in("conversation_id", conversationIds).order("created_at", { ascending: false }).limit(150) : Promise.resolve({ data: [] }),
  ]);
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const latestMessages = new Map<string, NonNullable<typeof messages>[number]>();
  for (const message of messages ?? []) if (!latestMessages.has(message.conversation_id)) latestMessages.set(message.conversation_id, message);
  const photos = await signedPhotoUrls(supabase, (profiles ?? []).map((profile) => profile.avatar_path));

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="sayHelloStart" /></span><h1><LocalizedPageText translationKey="messagesTitle" /></h1><p><LocalizedPageText translationKey="messagesIntro" /></p></div></div>
      {conversations?.length ? <div className="conversation-list">{conversations.map((conversation) => {
        const otherId = conversation.member_one === user.id ? conversation.member_two : conversation.member_one;
        const profile = profileMap.get(otherId);
        const latest = latestMessages.get(conversation.id);
        if (!profile) return null;
        return <Link key={conversation.id} href={`/messages/${conversation.id}`} className="conversation-row"><span className="conversation-avatar">{profile.avatar_path && photos.get(profile.avatar_path) ? <Image src={photos.get(profile.avatar_path)!} alt="" fill sizes="52px" /> : profile.display_name.slice(0, 1).toUpperCase()}</span><span className="conversation-copy"><strong>{profile.display_name}{profile.is_verified && <span className="verified-check" aria-hidden="true">✓</span>}</strong><span>{latest ? <>{latest.sender_id === user.id && <LocalizedPageText translationKey="youPrefix" />}{latest.body}</> : <LocalizedPageText translationKey="sayHelloStart" />}</span></span><span className="conversation-meta"><time><LocalizedDate value={latest?.created_at ?? conversation.last_message_at} /></time>{latest?.sender_id !== user.id && !latest?.read_at && <LocalizedUnreadIndicator />}</span></Link>;
      })}</div> : <div className="empty-state"><MessageCircle size={24} /><h2><LocalizedPageText translationKey="noConversationsTitle" /></h2><p><LocalizedPageText translationKey="noConversationsBody" /></p><Link className="button button-rose" href="/discover"><LocalizedPageText translationKey="findMember" /></Link></div>}
    </>
  );
}