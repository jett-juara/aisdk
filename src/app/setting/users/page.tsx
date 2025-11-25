import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "../_data";

export const metadata = {
  title: "User Management | JETT Setting",
  description: "Manajemen user untuk JETT Setting.",
};

export default async function DashboardUsersPage() {
  const user = await getSettingUserOrRedirect();

  return <SettingClient user={user} view="users" />;
}

