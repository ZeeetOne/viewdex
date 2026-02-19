import { Metadata } from "next";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AddTitleButton } from "@/components/dashboard/add-title-button";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your media tracking dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your anime, manga, and more
          </p>
        </div>
        <AddTitleButton />
      </div>

      <StatsCards />
      <RecentActivity />
    </div>
  );
}
