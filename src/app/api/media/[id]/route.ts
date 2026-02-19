import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { updateMediaSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await prisma.mediaItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if media exists and belongs to user
    const existingMedia = await prisma.mediaItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateMediaSchema.parse(body);

    // Handle status-related timestamps
    const updateData: Record<string, unknown> = { ...validatedData };

    // Set startedAt when status changes to active
    if (
      validatedData.status &&
      (validatedData.status === "WATCHING" ||
        validatedData.status === "READING") &&
      !existingMedia.startedAt
    ) {
      updateData.startedAt = new Date();
    }

    // Set completedAt when status changes to completed
    if (validatedData.status === "COMPLETED" && !existingMedia.completedAt) {
      updateData.completedAt = new Date();
    }

    // If progress equals totalUnits, auto-complete
    if (
      validatedData.progress !== undefined &&
      existingMedia.totalUnits &&
      validatedData.progress >= existingMedia.totalUnits
    ) {
      updateData.progress = existingMedia.totalUnits;
      if (!existingMedia.completedAt) {
        updateData.status = "COMPLETED";
        updateData.completedAt = new Date();
      }
    }

    const media = await prisma.mediaItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Update media error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if media exists and belongs to user
    const existingMedia = await prisma.mediaItem.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    await prisma.mediaItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
