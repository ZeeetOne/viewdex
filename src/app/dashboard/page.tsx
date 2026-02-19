import { Metadata } from "next";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your media tracking dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your anime, manga, and more
        </p>
      </div>

      <StatsCards />
      <RecentActivity />
    </div>
  );
}
