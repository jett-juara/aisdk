import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "../_data";

export const metadata = {
  title: "Permissions | JETT Setting",
  description: "Pengaturan permissions untuk JETT Setting.",
};

export default async function DashboardPermissionsPage() {
  const user = await getSettingUserOrRedirect();

  return <SettingClient user={user} view="permissions" />;
}

