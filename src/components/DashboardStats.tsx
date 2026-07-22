import { CardGrid, StatCard } from "canopui";
import type { AdminUser } from "../api/admin";
import { useDashboardStats } from "../hooks/useDashboardStats";

interface DashboardStatsProps {
  users: AdminUser[];
}

export default function DashboardStats({ users }: DashboardStatsProps) {
  const stats = useDashboardStats(users);

  return (
    <CardGrid minItemWidth="13rem" gap="md">
      {stats.map((stat) => (
        <StatCard
          key={stat.key}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          iconColor={stat.iconColor}
        />
      ))}
    </CardGrid>
  );
}
