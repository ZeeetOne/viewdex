"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedia } from "@/hooks/use-media";
import { Tv, CheckCircle, Clock, List } from "lucide-react";

export function StatsCards() {
  const { data: media, isLoading } = useMedia();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    total: media?.length || 0,
    watching: media?.filter(
      (m) => m.status === "WATCHING" || m.status === "READING"
    ).length || 0,
    completed: media?.filter((m) => m.status === "COMPLETED").length || 0,
    planned: media?.filter(
      (m) =>
        m.status === "PLAN_TO_WATCH" ||
        m.status === "PLAN_TO_READ" ||
        m.status === "PLAN_TO_CONSUME"
    ).length || 0,
  };

  const statItems = [
    {
      title: "Your List",
      value: stats.total,
      icon: List,
      description: "All items in your list",
    },
    {
      title: "Currently Active",
      value: stats.watching,
      icon: Tv,
      description: "Watching or reading now",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      description: "Finished items",
    },
    {
      title: "Planned",
      value: stats.planned,
      icon: Clock,
      description: "On your watchlist",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
