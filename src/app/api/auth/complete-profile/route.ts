import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { completeProfileSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Identity comes from the session, never from the request body
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate username
    const result = completeProfileSchema.safeParse({ username: body.username });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Check if user already exists (shouldn't happen, but just in case)
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create user in our database
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        username,
        provider: user.app_metadata?.provider === "google" ? "GOOGLE" : "EMAIL",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile completed successfully",
    });
  } catch (error) {
    // Lost a race with another request claiming the same username/email
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
