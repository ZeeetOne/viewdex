import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FABWrapper } from "@/components/layout/fab-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Get user from our database
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  });

  if (!user) {
    // User exists in Supabase but not in our DB - redirect to complete profile
    redirect(`/complete-profile?email=${encodeURIComponent(authUser.email || "")}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="container p-4 md:p-6">{children}</div>
        </main>
      </div>
      <BottomNav />
      <FABWrapper />
    </div>
  );
}
