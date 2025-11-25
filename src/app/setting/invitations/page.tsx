import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "../_data";

export const metadata = {
  title: "Invitations | JETT Setting",
  description: "Kelola undangan user baru untuk JETT Setting.",
};

export default async function DashboardInvitationsPage() {
  const user = await getSettingUserOrRedirect();

  return <SettingClient user={user} view="invitations" />;
}

