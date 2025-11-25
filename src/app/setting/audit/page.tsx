import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "../_data";

export const metadata = {
  title: "Audit Logs | JETT Setting",
  description: "Audit logs aktivitas penting di JETT Setting.",
};

export default async function DashboardAuditPage() {
  const user = await getSettingUserOrRedirect();

  return <SettingClient user={user} view="audit" />;
}

