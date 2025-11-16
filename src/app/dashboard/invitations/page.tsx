import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardUserOrRedirect } from "../_data";

export const metadata = {
  title: "Invitations | JETT Dashboard",
  description: "Kelola undangan user baru untuk JETT Dashboard.",
};

export default async function DashboardInvitationsPage() {
  const user = await getDashboardUserOrRedirect();

  return <DashboardClient user={user} view="invitations" />;
}

