import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  // Only allow same-origin relative paths; "//host" or "@host" would
  // otherwise turn `${origin}${next}` into a redirect to another site
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email: data.user.email! },
      });

      if (!existingUser) {
        // New OAuth user - redirect to complete profile
        return NextResponse.redirect(
          `${origin}/complete-profile?email=${encodeURIComponent(data.user.email!)}`
        );
      }

      // Existing user - redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // OAuth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
