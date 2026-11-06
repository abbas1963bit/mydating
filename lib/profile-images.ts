import type { SupabaseClient } from "@supabase/supabase-js";

export async function signedPhotoUrls(supabase: SupabaseClient, paths: (string | null | undefined)[]) {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (!uniquePaths.length) return new Map<string, string>();
  const { data } = await supabase.storage.from("profile-photos").createSignedUrls(uniquePaths, 600);
  return new Map((data ?? []).flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []));
}