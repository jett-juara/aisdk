/**
 * Dashboard Home Page - Overview untuk semua roles
 * Server component dengan auth protection dan client wrapper
 */

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardUserOrRedirect } from "./_data";

// Metadata untuk dashboard
export const metadata = {
  title: "Dashboard | JETT",
  description: "JETT Event Management Assistant Dashboard",
};

/**
 * Dashboard main page dengan server-side auth dan client wrapper
 */
export default async function DashboardPage() {
  const user = await getDashboardUserOrRedirect();

  return (
    <DashboardClient user={user} view="overview" />
  );
}
