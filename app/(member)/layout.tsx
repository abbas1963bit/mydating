import { redirect } from "next/navigation";
import { MemberShell } from "@/components/member-shell";
import { createClient } from "@/lib/supabase/server";

export default async function MemberLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=setup");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("display_name,role,is_active").eq("id", user.id).maybeSingle();
  if (!profile || !profile.is_active) redirect("/login?error=account");

  return <MemberShell displayName={profile.display_name} role={profile.role}>{children}</MemberShell>;
}