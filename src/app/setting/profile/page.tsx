import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "../_data";

export const metadata = {
  title: "My Profile | JETT Setting",
  description: "Profil akun untuk JETT Setting.",
};

export default async function DashboardProfilePage() {
  const user = await getSettingUserOrRedirect();

  return <SettingClient user={user} view="profile" />;
}

