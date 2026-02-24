"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Loader2 } from "lucide-react";

interface SettingsFormProps {
  user: {
    id: string;
    username: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    usernameChangedAt: Date | null;
  };
}

const COOLDOWN_DAYS = 30;

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();

  // Profile state
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

  // Username state
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    reason: string | null;
  }>({ checking: false, available: null, reason: null });

  // Email state
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email);

  // Calculate days until username can be changed
  const getDaysUntilUsernameChange = () => {
    if (!user.usernameChangedAt) return 0;
    const daysSinceChange = Math.floor(
      (Date.now() - new Date(user.usernameChangedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(0, COOLDOWN_DAYS - daysSinceChange);
  };

  const daysUntilUsernameChange = getDaysUntilUsernameChange();
  const canChangeUsername = daysUntilUsernameChange === 0;

  // Check username availability
  const checkUsername = useCallback(
    async (username: string) => {
      if (username === user.username) {
        setUsernameStatus({ checking: false, available: null, reason: null });
        return;
      }

      if (username.length < 3) {
        setUsernameStatus({
          checking: false,
          available: false,
          reason: "Username must be at least 3 characters",
        });
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
    },
    [user.username]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (newUsername && newUsername !== user.username) {
        checkUsername(newUsername);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [newUsername, checkUsername, user.username]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canChangeUsername) {
      toast.error(
        `You can change your username in ${daysUntilUsernameChange} days`
      );
      return;
    }

    if (newUsername === user.username) {
      toast.error("New username is the same as current");
      return;
    }

    if (usernameStatus.available === false) {
      toast.error(usernameStatus.reason || "Username not available");
      return;
    }

    setIsUsernameLoading(true);

    try {
      const response = await fetch("/api/user/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update username");
      }

      toast.success("Username updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update username"
      );
    } finally {
      setIsUsernameLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      toast.error("New email is the same as current");
      return;
    }

    setIsEmailLoading(true);

    try {
      const response = await fetch("/api/user/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update email");
      }

      toast.success(data.message || "Email updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update email"
      );
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isUsernameChanged = newUsername !== user.username;
  const isEmailChanged = newEmail.toLowerCase() !== user.email.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name and avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isProfileLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={isProfileLoading}
              />
            </div>

            <Button type="submit" disabled={isProfileLoading}>
              {isProfileLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Username */}
      <Card>
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription>
            Change your username (can be changed once every {COOLDOWN_DAYS} days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) =>
                    setNewUsername(e.target.value.toLowerCase())
                  }
                  disabled={isUsernameLoading || !canChangeUsername}
                  className="pr-10"
                />
                {isUsernameChanged && newUsername.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus.checking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : usernameStatus.available === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : usernameStatus.available === false ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : null}
                  </div>
                )}
              </div>
              {!canChangeUsername && (
                <p className="text-xs text-muted-foreground">
                  You can change your username in {daysUntilUsernameChange} day
                  {daysUntilUsernameChange === 1 ? "" : "s"}
                </p>
              )}
              {usernameStatus.reason && isUsernameChanged && (
                <p className="text-xs text-destructive">
                  {usernameStatus.reason}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                isUsernameLoading ||
                !canChangeUsername ||
                !isUsernameChanged ||
                usernameStatus.available === false ||
                usernameStatus.checking
              }
            >
              {isUsernameLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Username"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Change your email address. A verification link will be sent to the
            new address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isEmailLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isEmailLoading || !isEmailChanged}
            >
              {isEmailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>Sign out of your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
