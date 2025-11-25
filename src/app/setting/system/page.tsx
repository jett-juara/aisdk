import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "../_data";

export const metadata = {
  title: "System Health | JETT Setting",
  description: "Ringkasan kondisi sistem JETT.",
};

export default async function DashboardSystemPage() {
  const user = await getSettingUserOrRedirect();

  return <SettingClient user={user} view="system" />;
}

