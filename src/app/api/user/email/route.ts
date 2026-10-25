import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateEmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is the same
    if (currentUser.email.toLowerCase() === normalizedEmail) {
      return NextResponse.json(
        { error: "New email is the same as current" },
        { status: 400 }
      );
    }

    // Check if email is already used by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    // Update email in Supabase Auth
    // This will send a confirmation email to the new address
    const { error: supabaseError } = await supabase.auth.updateUser({
      email: normalizedEmail,
    });

    if (supabaseError) {
      console.error("Supabase email update error:", supabaseError);
      return NextResponse.json(
        { error: supabaseError.message || "Failed to update email" },
        { status: 400 }
      );
    }

    // Our database is not updated here: the change only applies once the
    // user confirms it, and syncUserEmail copies it over after that
    return NextResponse.json({
      message: "Check your new email to confirm the change.",
    });
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
