"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  age: z.preprocess((value) => Number(value), z.number().int().min(18).max(120)),
  password: z.string().min(10).max(72),
  confirmPassword: z.string(),
  terms: z.literal("on"),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"] });

const credentialsSchema = z.object({ email: z.email(), password: z.string().min(1).max(72) });

async function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/sign-up?error=${parsed.error.issues[0]?.path[0] === "confirmPassword" ? "password-mismatch" : "invalid"}`);

  const supabase = await createClient();
  if (!supabase) redirect("/sign-up?error=setup");
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name, age: parsed.data.age },
      emailRedirectTo: `${await getSiteUrl()}/auth/callback?next=/app`,
    },
  });
  if (error) redirect("/sign-up?error=signup");
  redirect("/sign-up?sent=1");
}

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=invalid");
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=setup");
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/login?error=credentials");
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_active").eq("id", user.id).maybeSingle()
    : { data: null };
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=account");
  }
  redirect("/app");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=setup");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await getSiteUrl()}/auth/callback?next=/app` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function requestPasswordReset(formData: FormData) {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) redirect("/forgot-password?error=invalid");
  const supabase = await createClient();
  if (!supabase) redirect("/forgot-password?error=setup");
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${await getSiteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) redirect("/forgot-password?error=send");
  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = z.string().min(10).max(72).safeParse(formData.get("password"));
  if (!password.success) redirect("/reset-password?error=password");
  const supabase = await createClient();
  if (!supabase) redirect("/reset-password?error=setup");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=session");
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) redirect("/reset-password?error=save");
  redirect("/login?updated=1");
}

export async function changeEmail(formData: FormData) {
  const email = z.email().transform((value) => value.trim().toLowerCase()).safeParse(formData.get("email"));
  if (!email.success) redirect("/settings?error=email");
  const supabase = await createClient();
  if (!supabase) redirect("/settings?error=setup");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.auth.updateUser({ email: email.data }, { emailRedirectTo: `${await getSiteUrl()}/auth/callback?next=/settings` });
  if (error) redirect("/settings?error=email");
  redirect("/settings?email=sent");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}