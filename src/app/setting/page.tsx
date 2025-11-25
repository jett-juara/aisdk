/**
 * Setting Home Page - Overview untuk semua roles
 * Server component dengan auth protection dan client wrapper
 */

import { SettingClient } from "@/components/setting/setting-client";
import { getSettingUserOrRedirect } from "./_data";

// Metadata untuk setting
export const metadata = {
  title: "Setting | JETT",
  description: "JETT Event Management Assistant Setting",
};

/**
 * Setting main page dengan server-side auth dan client wrapper
 */
export default async function SettingPage() {
  const user = await getSettingUserOrRedirect();

  return (
    <SettingClient user={user} view="overview" />
  );
}
