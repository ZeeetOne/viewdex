import { createClient } from "@supabase/supabase-js";

// Service role client: bypasses RLS and can manage auth users.
// Server-only; never import this from client components.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Removes an auth user whose profile could not be created, so the email can
// be registered again. Returns false when it couldn't (no service role key).
export async function deleteAuthUser(userId: string) {
  const admin = createAdminClient();
  if (!admin) {
    console.warn(
      `SUPABASE_SERVICE_ROLE_KEY not set: auth user ${userId} left without a profile`
    );
    return false;
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("Delete auth user error:", error);
    return false;
  }
  return true;
}
