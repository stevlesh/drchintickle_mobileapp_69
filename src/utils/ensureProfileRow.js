import { supabase } from "../lib/supabase";

export async function ensureProfileRow() {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return;
  await supabase.from("profiles").upsert({ id: u.user.id }, { onConflict: "id" });
}