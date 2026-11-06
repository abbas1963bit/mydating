"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireStaff(adminOnly = false) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=setup");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (adminOnly ? profile.role !== "admin" : !["admin", "moderator"].includes(profile.role))) redirect("/app");
  return { supabase, user, role: profile.role };
}

export async function reviewReport(formData: FormData) {
  const parsed = z.object({ report_id: z.uuid(), status: z.enum(["reviewing", "resolved", "dismissed"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin?error=report");
  const { supabase, user } = await requireStaff();
  const { error } = await supabase.from("reports").update({ status: parsed.data.status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", parsed.data.report_id);
  if (error) redirect("/admin?error=report");
  redirect("/admin?updated=1#reports");
}

export async function updateMemberAccess(formData: FormData) {
  const parsed = z.object({ user_id: z.uuid(), is_active: z.enum(["true", "false"]), role: z.enum(["member", "moderator", "admin"]).optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin?error=member");
  const { supabase, user, role } = await requireStaff(true);
  if (parsed.data.user_id === user.id) redirect("/admin?error=self");
  const update: { is_active: boolean; role?: "member" | "moderator" | "admin" } = { is_active: parsed.data.is_active === "true" };
  if (parsed.data.role) update.role = parsed.data.role;
  if (role !== "admin") redirect("/admin?error=permission");
  const { error } = await supabase.from("profiles").update(update).eq("id", parsed.data.user_id);
  if (error) redirect("/admin?error=member");
  redirect("/admin?updated=1#members");
}

export async function deleteMember(formData: FormData) {
  const targetId = z.uuid().safeParse(formData.get("user_id"));
  if (!targetId.success) redirect("/admin?error=member");
  const { user } = await requireStaff(true);
  if (targetId.data === user.id) redirect("/admin?error=self");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) redirect("/admin?error=service-key");
  const adminClient = createSupabaseClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await adminClient.auth.admin.deleteUser(targetId.data);
  if (error) redirect("/admin?error=member");
  redirect("/admin?deleted=1#members");
}