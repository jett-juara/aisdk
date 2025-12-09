/**
 * Preview Page - Dynamic route for previewing draft/review content
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Hero as AboutHero } from '@/components/about'
import { ProductHero } from '@/components/product/hero'
import { ServicesHero } from '@/components/services/hero'
import { getPageContent, getImageGrid } from '@/lib/cms/marketing'
import { PreviewBanner } from '@/components/setting/preview-banner'

type PageSlug = 'about' | 'product' | 'services'
type PreviewStatus = 'draft' | 'review'

interface PreviewPageProps {
    params: {
        slug: string
    }
    searchParams: {
        status?: string
    }
}

// Metadata for preview pages - prevent indexing
export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
    return {
        title: `Preview: ${params.slug} - JUARA Events`,
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
    const { slug } = params
    const status = (searchParams.status || 'draft') as PreviewStatus

    // Validate slug
    if (!['about', 'product', 'services'].includes(slug)) {
        notFound()
    }

    const pageSlug = slug as PageSlug

    // Fetch CMS content (TODO: filter by status when supported)
    const cmsContent = await getPageContent(pageSlug)
    const imageGridItems = await getImageGrid(pageSlug, 'hero_grid')

    // Render appropriate hero based on page
    let heroComponent: React.ReactNode

    if (pageSlug === 'about') {
        const whoWeAreBlock = cmsContent?.blocks.find(
            (block) => block.section === 'hero' && block.key === 'who_we_are'
        )
        const whatWeValueBlock = cmsContent?.blocks.find(
            (block) => block.section === 'hero' && block.key === 'what_we_value'
        )

        const heroData = {
            whoWeAreHeading: whoWeAreBlock?.content?.heading || undefined,
            whoWeAreBody: whoWeAreBlock?.content?.body || undefined,
            whatWeValueHeading: whatWeValueBlock?.content?.heading || undefined,
            whatWeValueBody: whatWeValueBlock?.content?.body || undefined,
            imageGridItems,
        }

        // TODO: AboutHero needs refactoring to accept props properly
        heroComponent = <AboutHero />
    } else if (pageSlug === 'product') {
        const heroBlock = cmsContent?.blocks.find(
            (block) => block.section === 'hero' && block.key === 'main'
        )

        const heroData = {
            heading: heroBlock?.content?.heading || 'Excellence in Action',
            subheading: heroBlock?.content?.subheading || 'Delivering success through innovation and integrity.',
            description: heroBlock?.content?.description || 'We create remarkable guest experiences by combining creative vision with precise execution.',
            imageGridItems,
        }

        heroComponent = <ProductHero {...heroData} />
    } else {
        // Services
        const heroBlock = cmsContent?.blocks.find(
            (block) => block.section === 'hero' && block.key === 'main'
        )

        const heroData = {
            heading: heroBlock?.content?.heading || 'End-to-End Services',
            subheading: heroBlock?.content?.subheading || 'From planning to execution—measured, secure, and on time.',
            description: heroBlock?.content?.description || 'We manage strategy, field execution, logistics, and authority liaison with clear SOPs.',
            imageGridItems,
        }

        heroComponent = <ServicesHero {...heroData} />
    }

    return (
        <div className="flex flex-col">
            <PreviewBanner status={status} />
            {heroComponent}
        </div>
    )
}
