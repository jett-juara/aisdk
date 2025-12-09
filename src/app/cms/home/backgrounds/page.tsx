import { getCmsUserOrRedirect } from "@/app/cms/_data"
import { getHomeData } from "@/lib/cms/home-service"
import { HomeFormWrapper } from "@/components/cms/home/home-form-wrapper"
import { CmsShell } from "@/components/cms/cms-shell"

export const dynamic = 'force-dynamic'

export default async function HomeBackgroundsPage() {
    const user = await getCmsUserOrRedirect()
    const data = await getHomeData()

    return (
        <CmsShell user={user} activePath="/cms/home/backgrounds">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-medium tracking-tight">Home Backgrounds</h1>
                    <p className="text-muted-foreground mt-1">
                        Atur gambar latar belakang untuk Mobile, Tablet, dan Desktop.
                    </p>
                </div>
            </div>

            {data ? (
                <HomeFormWrapper initialData={data} defaultTab="backgrounds" />
            ) : (
                <div className="p-10 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                    Data Home belum tersedia.
                </div>
            )}
        </CmsShell>
    )
}
