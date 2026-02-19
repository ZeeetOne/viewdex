import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tv, BookOpen, Star, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b px-4">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            <span className="text-primary">View</span>Dex
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Track what you{" "}
            <span className="text-primary">watch</span> and{" "}
            <span className="text-primary">read</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Keep track of your anime, manga, manhwa, and donghua progress.
            Never lose track of where you left off.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">Start Tracking Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 px-4 py-16">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Everything you need to track your media
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Tv}
              title="Track Progress"
              description="Keep track of episodes and chapters with a simple +1 button"
            />
            <FeatureCard
              icon={BookOpen}
              title="Watch & Read"
              description="Support for anime, donghua, manga, manhwa, and more"
            />
            <FeatureCard
              icon={Star}
              title="Rate & Review"
              description="Rate your favorites and add personal notes"
            />
            <FeatureCard
              icon={Smartphone}
              title="Mobile Ready"
              description="Install as an app on your phone for quick access"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="border-t px-4 py-16">
          <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to start tracking?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join ViewDex today and never forget where you left off.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/register">Create Free Account</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ViewDex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
