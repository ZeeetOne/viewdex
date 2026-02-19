"use client";

import { useState } from "react";
import { FAB } from "./fab";
import { MediaForm } from "@/components/media/media-form";

export function FABWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FAB onClick={() => setIsOpen(true)} />
      <MediaForm open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
