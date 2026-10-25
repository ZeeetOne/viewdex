import { prisma } from "@/lib/db";

// Supabase Auth is the source of truth for email. Email changes only take
// effect there after the user confirms, so copy it over once it differs.
export async function syncUserEmail(userId: string, authEmail: string | undefined) {
  if (!authEmail) return;

  const email = authEmail.toLowerCase();
  try {
    await prisma.user.updateMany({
      where: { id: userId, NOT: { email } },
      data: { email },
    });
  } catch (error) {
    // e.g. unique conflict with another row; keep the old value
    console.error("Sync user email error:", error);
  }
}
