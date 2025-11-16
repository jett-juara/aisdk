import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardUserOrRedirect } from "../_data";

export const metadata = {
  title: "My Profile | JETT Dashboard",
  description: "Profil akun untuk JETT Dashboard.",
};

export default async function DashboardProfilePage() {
  const user = await getDashboardUserOrRedirect();

  return <DashboardClient user={user} view="profile" />;
}

