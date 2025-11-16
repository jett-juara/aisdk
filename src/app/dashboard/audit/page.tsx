import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardUserOrRedirect } from "../_data";

export const metadata = {
  title: "Audit Logs | JETT Dashboard",
  description: "Audit logs aktivitas penting di JETT Dashboard.",
};

export default async function DashboardAuditPage() {
  const user = await getDashboardUserOrRedirect();

  return <DashboardClient user={user} view="audit" />;
}

