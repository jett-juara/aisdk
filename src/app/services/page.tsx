import { Metadata } from "next"
import { ServicesHero } from "@/components/services/hero"
import { getPageContent, getImageGrid, getPageSeo } from "@/lib/cms/marketing"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('services');

  return {
    title: seo.title || 'Our Services - JUARA Events',
    description: seo.description || 'Comprehensive event services from JUARA - creative planning & development, execution handling, talent & logistics management, and local authority liaison.',
    openGraph: seo.ogImage ? {
      images: [{ url: seo.ogImage }],
    } : undefined,
    alternates: seo.canonicalUrl ? {
      canonical: seo.canonicalUrl,
    } : undefined,
  };
}

export default async function ServicesPage() {
  // Fetch CMS content for Services page
  const cmsContent = await getPageContent('services')

  // Extract hero content from CMS or use defaults
  const heroBlock = cmsContent?.blocks.find(
    (block) => block.section === 'hero' && block.key === 'main'
  )

  // Fetch image grid items
  const imageGridItems = await getImageGrid('services', 'hero_grid')

  const heroData = {
    heading: heroBlock?.content?.heading || "End-to-End Services",
    subheading: heroBlock?.content?.subheading || "From planning to execution—measured, secure, and on time.",
    description: heroBlock?.content?.description || "We manage strategy, field execution, logistics, and authority liaison with clear SOPs. Our focus is on governance, compliance, and delivering a seamless audience experience.",
    imageGridItems,
  }

  return (
    <div className="flex flex-col">
      <ServicesHero {...heroData} />
    </div>
  )
}
