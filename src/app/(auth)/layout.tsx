import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">View</span>
            <span>Dex</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container flex justify-center text-sm text-muted-foreground px-4">
          <p>&copy; {new Date().getFullYear()} ViewDex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
