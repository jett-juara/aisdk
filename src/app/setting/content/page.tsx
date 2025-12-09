import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSettingUserOrRedirect } from "../_data";

export default async function ContentManagementPage() {
  await getSettingUserOrRedirect();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">
          Kelola CMS di halaman khusus. Klik tombol di bawah untuk membuka CMS dengan layout penuh.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background-800/70 p-6 flex flex-col gap-4">
        <div className="text-sm text-text-200">
          CMS hanya dapat diakses oleh admin/superadmin. Anda akan dialihkan ke halaman <code>/cms</code>{" "}
          dengan sidebar khusus untuk About, Product, Services, dan Collaboration.
        </div>
        <div>
          <Button asChild className="bg-button-primary hover:bg-button-primary-hover">
            <Link href="/cms">Buka CMS</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
