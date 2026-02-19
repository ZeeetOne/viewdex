"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { completeProfileSchema } from "@/lib/validations";
import { Check, X } from "lucide-react";

export function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    reason: string | null;
  }>({ checking: false, available: null, reason: null });

  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus({ checking: false, available: null, reason: null });
      return;
    }

    setUsernameStatus({ checking: true, available: null, reason: null });

    try {
      const response = await fetch(
        `/api/auth/check-username?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();
      setUsernameStatus({
        checking: false,
        available: data.available,
        reason: data.reason,
      });
    } catch {
      setUsernameStatus({ checking: false, available: null, reason: null });
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    const result = completeProfileSchema.safeParse({ username });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    if (usernameStatus.available === false) {
      setError(usernameStatus.reason || "Username not available");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expired. Please sign in again.");
        router.push("/login");
        return;
      }

      // Create user in our database via API
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to complete profile");
        return;
      }

      toast.success("Welcome to ViewDex!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <p className="text-sm text-muted-foreground">
          Welcome! Choose a username to complete your profile.
        </p>
        {email && (
          <p className="text-sm">
            Signed in as <span className="font-medium">{email}</span>
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="pr-10"
              />
              {username.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus.checking ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  ) : usernameStatus.available === true ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : usernameStatus.available === false ? (
                    <X className="h-4 w-4 text-destructive" />
                  ) : null}
                </div>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {usernameStatus.reason && !error && (
              <p className="text-sm text-destructive">{usernameStatus.reason}</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 characters. Letters, numbers, and underscores only.
            </p>
          </div>
          <Button
            type="submit"
            disabled={isLoading || usernameStatus.available === false}
            className="w-full"
          >
            {isLoading ? "Creating profile..." : "Complete Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
