import { Metadata } from "next";
import { Hero } from "@/components/about";
import { getPageContent, getImageGrid, getPageSeo, getDetailBlocks } from "@/lib/cms/marketing";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('about');

  return {
    title: seo.title || 'About Us - JUARA Events',
    description: seo.description || 'Learn about JUARA Events - an off the grid event company combining creativity with technology to deliver premium event experiences.',
    openGraph: seo.ogImage ? {
      images: [{ url: seo.ogImage }],
    } : undefined,
    alternates: seo.canonicalUrl ? {
      canonical: seo.canonicalUrl,
    } : undefined,
  };
}

export default async function AboutPage() {
  // Fetch CMS content for About page
  const cmsContent = await getPageContent('about')
  const detailBlocks = await getDetailBlocks('about')
  const detailMap = Object.fromEntries(detailBlocks.map((d) => [d.itemSlug, d]))

  // Extract content blocks from CMS or use defaults
  const whoWeAreBlock = cmsContent?.blocks.find(
    (block) => block.section === 'hero' && block.key === 'who_we_are'
  )
  const whatWeValueBlock = cmsContent?.blocks.find(
    (block) => block.section === 'hero' && block.key === 'what_we_value'
  )

  // Fetch image grid items
  const imageGridItems = await getImageGrid('about', 'hero_grid')

  const heroData = {
    whoWeAreHeading: whoWeAreBlock?.content?.heading || undefined,
    whoWeAreBody: whoWeAreBlock?.content?.body || undefined,
    whatWeValueHeading: whatWeValueBlock?.content?.heading || undefined,
    whatWeValueBody: whatWeValueBlock?.content?.body || undefined,
    imageGridItems, // Pass image grid to hero
    detailBlocks: detailMap,
  }

  return <Hero {...heroData} />
}
