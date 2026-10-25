import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { syncUserEmail } from "@/lib/user-sync";
import { loginSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const { identifier, password } = validatedData;

    // Check if identifier is email or username
    const isEmail = identifier.includes("@");
    let email = identifier;

    if (!isEmail) {
      // Lookup email by username
      const user = await prisma.user.findUnique({
        where: { username: identifier },
        select: { email: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid username or password" },
          { status: 401 }
        );
      }

      email = user.email;
    }

    // Sign in with Supabase
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    await syncUserEmail(data.user.id, data.user.email);

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
