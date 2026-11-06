"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function authenticatedClient(destination = "/login") {
  const supabase = await createClient();
  if (!supabase) redirect(`${destination}?error=setup`);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(destination);
  return { supabase, user };
}

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(60),
  age: z.preprocess((value) => value === "" ? null : Number(value), z.number().int().min(18).max(120).nullable()),
  gender: z.string().trim().max(40),
  country: z.string().trim().max(100),
  city: z.string().trim().max(100),
  locale: z.string().trim().max(20),
  marital_status: z.string().trim().max(40),
  occupation: z.string().trim().max(100),
  education: z.string().trim().max(100),
  interests: z.string().max(1000),
  bio: z.string().trim().max(1200),
  looking_for: z.string().trim().max(800),
  preferred_min_age: z.preprocess((value) => value === "" ? null : Number(value), z.number().int().min(18).max(120).nullable()),
  preferred_max_age: z.preprocess((value) => value === "" ? null : Number(value), z.number().int().min(18).max(120).nullable()),
  preferred_gender: z.string().trim().max(40),
  preferred_country: z.string().trim().max(100),
  preferred_city: z.string().trim().max(100),
  preferred_language: z.string().trim().max(20),
  preferred_interests: z.string().max(1000),
  visibility: z.enum(["public", "members", "private"]),
});

function commaList(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 30);
}

export async function saveProfile(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) redirect("/profile/edit?error=invalid");
  if (parsed.data.preferred_min_age && parsed.data.preferred_max_age && parsed.data.preferred_min_age > parsed.data.preferred_max_age) {
    redirect("/profile/edit?error=age-range");
  }

  const { supabase, user } = await authenticatedClient("/login");
  const { error } = await supabase.from("profiles").update({
    ...parsed.data,
    interests: commaList(parsed.data.interests),
    preferred_interests: commaList(parsed.data.preferred_interests),
    gender: parsed.data.gender || null,
    country: parsed.data.country || null,
    city: parsed.data.city || null,
    marital_status: parsed.data.marital_status || null,
    occupation: parsed.data.occupation || null,
    education: parsed.data.education || null,
    preferred_country: parsed.data.preferred_country || null,
    preferred_city: parsed.data.preferred_city || null,
    preferred_gender: parsed.data.preferred_gender || null,
    preferred_language: parsed.data.preferred_language || null,
    show_age: formData.has("show_age"),
    show_city: formData.has("show_city"),
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);
  if (error) redirect("/profile/edit?error=save");
  redirect("/profile?updated=1");
}

export async function likeUser(formData: FormData) {
  const targetId = z.uuid().safeParse(formData.get("user_id"));
  if (!targetId.success) redirect("/discover?error=invalid");
  const { supabase, user } = await authenticatedClient("/login");
  const { error } = await supabase.from("likes").upsert({ from_user_id: user.id, to_user_id: targetId.data }, { onConflict: "from_user_id,to_user_id", ignoreDuplicates: true });
  if (error) redirect("/discover?error=action");
  redirect("/discover?liked=1");
}

export async function unlikeUser(formData: FormData) {
  const targetId = z.uuid().safeParse(formData.get("user_id"));
  if (!targetId.success) redirect("/likes?error=invalid");
  const { supabase, user } = await authenticatedClient("/likes");
  const { error } = await supabase.from("likes").delete().eq("from_user_id", user.id).eq("to_user_id", targetId.data);
  if (error) redirect("/likes?error=action");
  redirect("/likes?updated=1");
}

export async function recordVisit(targetId: string) {
  const parsedId = z.uuid().safeParse(targetId);
  if (!parsedId.success) return;
  const { supabase, user } = await authenticatedClient("/login");
  if (user.id === parsedId.data) return;
  await supabase.from("profile_visits").insert({ visitor_id: user.id, visited_id: parsedId.data });
}

export async function startConversation(formData: FormData) {
  const targetId = z.uuid().safeParse(formData.get("user_id"));
  if (!targetId.success) redirect("/discover?error=invalid");
  const { supabase } = await authenticatedClient("/login");
  const { data, error } = await supabase.rpc("start_conversation", { other_user: targetId.data });
  if (error || !data) redirect("/discover?error=conversation");
  redirect(`/messages/${data}`);
}

export async function sendMessage(formData: FormData) {
  const parsed = z.object({ conversation_id: z.uuid(), body: z.string().trim().min(1).max(2000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/messages?error=invalid");
  const { supabase, user } = await authenticatedClient("/messages");
  const { error } = await supabase.from("messages").insert({
    conversation_id: parsed.data.conversation_id,
    sender_id: user.id,
    body: parsed.data.body,
  });
  if (error) redirect(`/messages/${parsed.data.conversation_id}?error=send`);
  redirect(`/messages/${parsed.data.conversation_id}`);
}

export async function markMessageRead(messageId: string) {
  const id = z.uuid().safeParse(messageId);
  if (!id.success) return;
  const { supabase } = await authenticatedClient("/login");
  await supabase.rpc("mark_message_read", { message_id: id.data });
}

export async function markNotificationRead(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("notification_id"));
  if (!id.success) return;
  const { supabase, user } = await authenticatedClient("/notifications");
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id.data).eq("user_id", user.id);
}

export async function blockUser(formData: FormData) {
  const targetId = z.uuid().safeParse(formData.get("user_id"));
  if (!targetId.success) redirect("/discover?error=invalid");
  const { supabase, user } = await authenticatedClient("/login");
  const { error } = await supabase.from("blocks").upsert({ blocker_id: user.id, blocked_id: targetId.data }, { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true });
  if (error) redirect("/discover?error=action");
  redirect("/settings/blocked?updated=1");
}

export async function unblockUser(formData: FormData) {
  const targetId = z.uuid().safeParse(formData.get("user_id"));
  if (!targetId.success) redirect("/settings/blocked?error=invalid");
  const { supabase, user } = await authenticatedClient("/settings/blocked");
  await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", targetId.data);
  redirect("/settings/blocked?updated=1");
}

export async function reportUser(formData: FormData) {
  const parsed = z.object({
    user_id: z.uuid(),
    reason: z.enum(["fake_profile", "harassment", "spam", "underage", "inappropriate_content", "other"]),
    details: z.string().trim().max(1500),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/discover?error=invalid");
  const { supabase, user } = await authenticatedClient("/login");
  const { error } = await supabase.from("reports").insert({ reporter_id: user.id, reported_id: parsed.data.user_id, reason: parsed.data.reason, details: parsed.data.details });
  if (error) redirect("/discover?error=report");
  redirect("/discover?reported=1");
}

function imageType(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", extension: "jpg" };
  if (bytes[0] === 0x89 && String.fromCharCode(...bytes.slice(1, 4)) === "PNG") return { mime: "image/png", extension: "png" };
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return { mime: "image/webp", extension: "webp" };
  return null;
}

export async function uploadProfilePhoto(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size < 1 || file.size > 8 * 1024 * 1024) redirect("/profile/edit?error=photo-size");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = imageType(bytes);
  if (!detected || detected.mime !== file.type) redirect("/profile/edit?error=photo-type");

  const { supabase, user } = await authenticatedClient("/login");
  const path = `${user.id}/${crypto.randomUUID()}.${detected.extension}`;
  const { error: uploadError } = await supabase.storage.from("profile-photos").upload(path, file, {
    contentType: detected.mime,
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) redirect("/profile/edit?error=photo-save");

  await supabase.from("profile_photos").update({ is_primary: false }).eq("user_id", user.id).eq("is_primary", true);
  const { error: photoError } = await supabase.from("profile_photos").insert({ user_id: user.id, object_path: path, is_primary: true, visibility: "members" });
  if (photoError) {
    await supabase.storage.from("profile-photos").remove([path]);
    redirect("/profile/edit?error=photo-save");
  }
  await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id);
  redirect("/profile/edit?photo=1");
}

export async function deleteProfilePhoto(formData: FormData) {
  const photoId = z.uuid().safeParse(formData.get("photo_id"));
  if (!photoId.success) redirect("/profile/edit?error=photo");
  const { supabase, user } = await authenticatedClient("/login");
  const { data: photo } = await supabase.from("profile_photos").select("id,object_path,is_primary").eq("id", photoId.data).eq("user_id", user.id).maybeSingle();
  if (!photo) redirect("/profile/edit?error=photo");
  const { error } = await supabase.from("profile_photos").delete().eq("id", photo.id).eq("user_id", user.id);
  if (error) redirect("/profile/edit?error=photo");
  await supabase.storage.from("profile-photos").remove([photo.object_path]);
  if (photo.is_primary) {
    const { data: nextPhoto } = await supabase.from("profile_photos").select("id,object_path").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (nextPhoto) await supabase.from("profile_photos").update({ is_primary: true }).eq("id", nextPhoto.id);
    await supabase.from("profiles").update({ avatar_path: nextPhoto?.object_path ?? null }).eq("id", user.id);
  }
  redirect("/profile/edit?photo=1");
}

export async function updatePhotoVisibility(formData: FormData) {
  const parsed = z.object({ photo_id: z.uuid(), visibility: z.enum(["public", "members", "private"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/profile/edit?error=photo");
  const { supabase, user } = await authenticatedClient("/login");
  const { error } = await supabase.from("profile_photos").update({ visibility: parsed.data.visibility }).eq("id", parsed.data.photo_id).eq("user_id", user.id);
  if (error) redirect("/profile/edit?error=photo");
  redirect("/profile/edit?photo=1");
}

export async function deactivateAccount(formData: FormData) {
  if (formData.get("confirm") !== "on") redirect("/settings?error=confirm");
  const { supabase } = await authenticatedClient("/login");
  await supabase.rpc("deactivate_own_account");
  await supabase.auth.signOut();
  redirect("/?deactivated=1");
}

export async function deleteAccount(formData: FormData) {
  if (formData.get("confirm") !== "on") redirect("/settings?error=confirm");
  const { supabase } = await authenticatedClient("/login");
  const { error } = await supabase.rpc("delete_own_account");
  if (error) redirect("/settings?error=delete");
  await supabase.auth.signOut();
  redirect("/");
}