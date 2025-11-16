import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardUserOrRedirect } from "../_data";

export const metadata = {
  title: "System Health | JETT Dashboard",
  description: "Ringkasan kondisi sistem JETT.",
};

export default async function DashboardSystemPage() {
  const user = await getDashboardUserOrRedirect();

  return <DashboardClient user={user} view="system" />;
}

