import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardUserOrRedirect } from "../_data";

export const metadata = {
  title: "Security | JETT Dashboard",
  description: "Pengaturan keamanan untuk JETT Dashboard.",
};

export default async function DashboardSecurityPage() {
  const user = await getDashboardUserOrRedirect();

  return <DashboardClient user={user} view="security" />;
}

