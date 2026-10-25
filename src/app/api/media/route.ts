import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { createMediaSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { MediaType, MediaCategory, TrackStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as MediaType | null;
    const category = searchParams.get("category") as MediaCategory | null;
    const status = searchParams.get("status") as TrackStatus | null;
    const search = searchParams.get("search");
    const SORTABLE_FIELDS = ["updatedAt", "createdAt", "title", "rating", "progress", "status"];
    const sortByParam = searchParams.get("sortBy");
    const sortBy = sortByParam && SORTABLE_FIELDS.includes(sortByParam) ? sortByParam : "updatedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {
      userId: user.id,
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const media = await prisma.mediaItem.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createMediaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const { totalUnits } = validatedData;
    let { progress, status } = validatedData;
    if (totalUnits && progress > totalUnits) {
      progress = totalUnits;
    }
    if (totalUnits && status === "COMPLETED") {
      progress = totalUnits;
    } else if (totalUnits && progress >= totalUnits && status === "IN_PROGRESS") {
      status = "COMPLETED";
    }
    const now = new Date();

    const media = await prisma.mediaItem.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        type: validatedData.type,
        category: validatedData.category,
        imageUrl: validatedData.imageUrl || null,
        totalUnits,
        status,
        progress,
        rating: validatedData.rating,
        notes: validatedData.notes,
        startedAt: status === "IN_PROGRESS" || status === "COMPLETED" ? now : null,
        completedAt: status === "COMPLETED" ? now : null,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Create media error:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}
