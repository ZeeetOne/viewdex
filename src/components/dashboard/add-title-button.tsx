"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaForm } from "@/components/media/media-form";
import { FAB } from "@/components/layout/fab";
import { Plus } from "lucide-react";

export function AddTitleButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)} className="hidden sm:inline-flex">
        <Plus className="mr-2 h-4 w-4" />
        Add Title
      </Button>
      <FAB onClick={() => setShowForm(true)} />
      <MediaForm
        open={showForm}
        onOpenChange={() => setShowForm(false)}
        editMedia={null}
      />
    </>
  );
}
