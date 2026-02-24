import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const COOLDOWN_DAYS = 30;

const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .transform((val) => val.toLowerCase()),
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
    const result = updateUsernameSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, usernameChangedAt: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if username is the same
    if (currentUser.username === username) {
      return NextResponse.json(
        { error: "New username is the same as current" },
        { status: 400 }
      );
    }

    // Check cooldown period
    if (currentUser.usernameChangedAt) {
      const daysSinceChange = Math.floor(
        (Date.now() - currentUser.usernameChangedAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSinceChange < COOLDOWN_DAYS) {
        const daysRemaining = COOLDOWN_DAYS - daysSinceChange;
        return NextResponse.json(
          {
            error: `You can change your username again in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`,
          },
          { status: 400 }
        );
      }
    }

    // Check if username is available
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update username
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        usernameChangedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        usernameChangedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
