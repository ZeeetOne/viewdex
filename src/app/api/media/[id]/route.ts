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

    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.imageUrl !== undefined) {
      updateData.imageUrl = validatedData.imageUrl || null;
    }

    // Resolve the values the item will have after this update, so checks use
    // the new totalUnits/progress instead of the stale ones in the database
    const totalUnits =
      validatedData.totalUnits !== undefined
        ? validatedData.totalUnits
        : existingMedia.totalUnits;
    let progress = validatedData.progress ?? existingMedia.progress;
    // The edit form always sends status, so only treat it as a user choice
    // when it actually differs from the current one
    const statusChanged =
      validatedData.status !== undefined &&
      validatedData.status !== existingMedia.status;
    let status = validatedData.status ?? existingMedia.status;

    if (totalUnits && progress > totalUnits) {
      progress = totalUnits;
    }

    if (!statusChanged) {
      if (totalUnits && progress >= totalUnits) {
        // Reached the end (e.g. via +1 button)
        status = "COMPLETED";
      } else if (status === "COMPLETED" && totalUnits && progress < totalUnits) {
        // Progress went back or totalUnits grew (new season/chapters)
        status = "IN_PROGRESS";
      } else if (status === "PLANNED" && progress > existingMedia.progress) {
        status = "IN_PROGRESS";
      }
    } else if (status === "IN_PROGRESS" && totalUnits && progress >= totalUnits) {
      status = "COMPLETED";
    } else if (status === "COMPLETED" && totalUnits) {
      // Marking as completed fills the progress
      progress = totalUnits;
    }

    updateData.progress = progress;
    updateData.status = status;

    if ((status === "IN_PROGRESS" || status === "COMPLETED") && !existingMedia.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === "COMPLETED" && existingMedia.status !== "COMPLETED") {
      updateData.completedAt = new Date();
    } else if (status !== "COMPLETED" && existingMedia.completedAt) {
      updateData.completedAt = null;
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
