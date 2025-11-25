import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "../_data";

export const metadata = {
  title: "Security | JETT Setting",
  description: "Pengaturan keamanan untuk JETT Setting.",
};

export default async function DashboardSecurityPage() {
  const user = await getSettingUserOrRedirect();

  return <SettingClient user={user} view="security" />;
}

