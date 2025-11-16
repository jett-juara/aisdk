import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardUserOrRedirect } from "../_data";

export const metadata = {
  title: "Permissions | JETT Dashboard",
  description: "Pengaturan permissions untuk JETT Dashboard.",
};

export default async function DashboardPermissionsPage() {
  const user = await getDashboardUserOrRedirect();

  return <DashboardClient user={user} view="permissions" />;
}

