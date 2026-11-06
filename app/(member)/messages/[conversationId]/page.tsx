import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { sendMessage } from "@/app/actions/members";
import { ChatRefresh } from "@/components/chat-refresh";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "@/lib/profile-images";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params, searchParams }: { params: Promise<{ conversationId: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ conversationId }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) notFound();
  const { data: conversation } = await supabase.from("conversations").select("id,member_one,member_two").eq("id", conversationId).maybeSingle();
  if (!conversation) notFound();
  const otherId = conversation.member_one === user.id ? conversation.member_two : conversation.member_one;
  const [{ data: other }, { data: own }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,avatar_path,is_verified").eq("id", otherId).maybeSingle(),
    supabase.from("profiles").select("avatar_path").eq("id", user.id).maybeSingle(),
  ]);
  if (!other) notFound();
  await supabase.rpc("mark_conversation_read", { target_conversation: conversationId });
  const { data: messages } = await supabase.from("messages").select("id,sender_id,body,created_at,delivered_at,read_at").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(100);
  const photoUrls = await signedPhotoUrls(supabase, [other.avatar_path, own?.avatar_path]);

  return (
    <section className="chat-panel">
      <ChatRefresh />
      <header className="chat-header"><Link href="/messages" className="chat-back" aria-label="Back to messages"><ArrowLeft size={17} /></Link><Link href={`/members/${other.id}`} className="chat-person"><span className="conversation-avatar">{other.avatar_path && photoUrls.get(other.avatar_path) ? <Image src={photoUrls.get(other.avatar_path)!} alt="" fill sizes="42px" /> : other.display_name.slice(0, 1).toUpperCase()}</span><span><strong>{other.display_name}{other.is_verified && <span className="verified-check">✓</span>}</strong><small>Private conversation</small></span></Link><Link href={`/members/${other.id}`} className="icon-button" aria-label="Member profile" title="Member profile"><ShieldCheck size={17} /></Link></header>
      <div className="chat-safety"><MessageCircle size={14} />Text and emoji only. Never share information you are not comfortable sharing.</div>
      <div className="chat-messages" aria-live="polite">
        {messages?.length ? messages.map((message) => {
          const mine = message.sender_id === user.id;
          const status = message.read_at ? "Read" : message.delivered_at ? "Delivered" : "Sent";
          return <div key={message.id} className={`message-line ${mine ? "mine" : "theirs"}`}><div className="message-bubble"><p>{message.body}</p><div className="message-meta"><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>{mine && <span>{status}</span>}</div></div></div>;
        }) : <div className="chat-empty"><MessageCircle size={22} /><p>A good conversation can start with one simple question.</p></div>}
      </div>
      {query.error && <p className="form-error chat-error" role="alert">Your message could not be sent. Please try again.</p>}
      <form className="chat-compose" action={sendMessage}><input type="hidden" name="conversation_id" value={conversationId} /><label className="sr-only" htmlFor="message">Write a message</label><textarea id="message" name="body" maxLength={2000} rows={1} placeholder="Write a message…" required /><span className="form-hint">Text and emoji only</span><button className="button button-rose" type="submit">Send</button></form>
    </section>
  );
}