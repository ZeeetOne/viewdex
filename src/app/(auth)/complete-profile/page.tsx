import { Metadata } from "next";
import { Suspense } from "react";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";

export const metadata: Metadata = {
  title: "Complete Profile",
  description: "Choose a username to complete your ViewDex profile",
};

export default function CompleteProfilePage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-2xl font-bold">Almost there!</h1>
        <p className="text-muted-foreground">
          Choose a username to complete your profile
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CompleteProfileForm />
      </Suspense>
    </div>
  );
}
