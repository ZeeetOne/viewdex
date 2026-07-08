import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tv, BookOpen, Star, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="px-4">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image
              src="/icons/icon-192x192.png"
              alt="ViewDex"
              width={28}
              height={28}
              className="rounded-md"
              priority
            />
            <span>
              <span className="text-primary">View</span>Dex
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
      <section className="px-4 pt-16 pb-8 sm:pt-24">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Never lose your place in anything you{" "}
            <span className="text-brand-gradient">watch</span> or{" "}
            <span className="text-brand-gradient">read</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-balance">
            Track anime, donghua, manga, manhwa, manhua, and comics —
            one +1 at a time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {user ? (
              <Button size="lg" className="bg-brand-gradient border-0 text-white hover:opacity-90" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="bg-brand-gradient border-0 text-white hover:opacity-90" asChild>
                  <Link href="/register">Start tracking — it&apos;s free</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="px-4 pb-20" aria-hidden="true">
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute -inset-8 rounded-full bg-brand-gradient opacity-15 blur-3xl" />
          <div className="relative divide-y rounded-2xl border bg-card shadow-lg">
            <MockupRow
              title="One Piece"
              type="Anime"
              unit="EP 1102"
              progress={74}
              thumbClass="from-sky-500 to-indigo-600"
            />
            <MockupRow
              title="Solo Leveling"
              type="Manhwa"
              unit="CH 179"
              progress={90}
              thumbClass="from-violet-500 to-purple-700"
            />
            <MockupRow
              title="Berserk"
              type="Manga"
              unit="CH 375"
              progress={55}
              thumbClass="from-slate-500 to-slate-800"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-10 text-center sm:grid-cols-3">
            <Step
              number="1"
              title="Add your series"
              description="Add anything you're watching or reading, in any format."
            />
            <Step
              number="2"
              title="Hit +1"
              description="One tap when you finish an episode or chapter."
            />
            <Step
              number="3"
              title="Pick up where you left off"
              description="Your progress is always there, on any device."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-balance sm:text-3xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Tv}
              title="Track progress"
              description="Episodes and chapters, updated with a single +1"
            />
            <FeatureCard
              icon={BookOpen}
              title="Watch & read"
              description="Anime, donghua, manga, manhwa, manhua, comics, and more"
            />
            <FeatureCard
              icon={Star}
              title="Rate & review"
              description="Score your favorites and keep personal notes"
            />
            <FeatureCard
              icon={Smartphone}
              title="Mobile ready"
              description="Install it as an app for one-tap updates on the go"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="border-t px-4 py-20">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-balance sm:text-3xl">
              Ready to start tracking?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join ViewDex today and never forget where you left off.
            </p>
            <Button
              size="lg"
              className="mt-8 bg-brand-gradient border-0 text-white hover:opacity-90"
              asChild
            >
              <Link href="/register">Create Free Account</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ViewDex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function MockupRow({
  title,
  type,
  unit,
  progress,
  thumbClass,
}: {
  title: string;
  type: string;
  unit: string;
  progress: number;
  thumbClass: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div
        className={`h-14 w-10 shrink-0 rounded-md bg-gradient-to-br ${thumbClass}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate font-semibold">{title}</p>
          <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {type}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-gradient"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {unit}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
          +1
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-brand-gradient text-4xl font-bold">{number}</span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground text-balance">
        {description}
      </p>
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
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
