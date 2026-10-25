import { createClient } from "@/lib/supabase/server";
import { deleteAuthUser } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const limited = await rateLimit("register", getClientIp(request));
    if (limited) return limited;

    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const { username, email, password } = validatedData;

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered. Try logging in." },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 400 }
      );
    }

    // Create Supabase auth user
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // With email enumeration protection on, signing up an email that already
    // exists in Supabase returns a placeholder user with no identities instead
    // of an error. Its id isn't real, so don't create a profile for it.
    if (authData.user.identities?.length === 0) {
      return NextResponse.json(
        { error: "Email already registered. Try logging in." },
        { status: 400 }
      );
    }

    // Create user in our database. If this fails, roll back the auth user so
    // the account isn't left half-created
    try {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email,
          username,
          provider: "EMAIL",
        },
      });
    } catch (error) {
      await deleteAuthUser(authData.user.id);

      // Lost a race with another signup using the same username/email
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Username or email already taken." },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
