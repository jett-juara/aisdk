import { getImageGridItems, getPageStatus } from '@/lib/cms/cms-admin'
import { ContentManagement } from '@/components/setting/content-management'
import { getSettingUserOrRedirect } from '../_data'

export default async function ContentManagementPage() {
    // Get user for role-based permissions
    const user = await getSettingUserOrRedirect()

    // Fetch initial data for all pages
    const [aboutItems, productItems, servicesItems, collaborationItems, aboutStatus, productStatus, servicesStatus, collaborationStatus] = await Promise.all([
        getImageGridItems('about', 'hero_grid'),
        getImageGridItems('product', 'hero_grid'),
        getImageGridItems('services', 'hero_grid'),
        getImageGridItems('collaboration', 'hero_grid'),
        getPageStatus('about'),
        getPageStatus('product'),
        getPageStatus('services'),
        getPageStatus('collaboration'),
    ])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Manage image grids for marketing pages. Upload, edit, and reorder images for About,
                    Product, Services, and Collaboration pages.
                </p>
            </div>

            <ContentManagement
                user={user}
                initialData={{
                    about: aboutItems,
                    product: productItems,
                    services: servicesItems,
                    collaboration: collaborationItems,
                }}
                initialStatuses={{
                    about: aboutStatus || 'draft',
                    product: productStatus || 'draft',
                    services: servicesStatus || 'draft',
                    collaboration: collaborationStatus || 'draft',
                }}
            />
        </div>
    )
}
