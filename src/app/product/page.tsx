import React from "react"
import { Metadata } from "next"
import { ProductHero } from "@/components/product/hero"
import { getPageContent, getImageGrid, getPageSeo } from "@/lib/cms/marketing"

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('product');

  return {
    title: seo.title || 'Our Products - JUARA Events',
    description: seo.description || 'Discover JUARA Events products and services - from creative agency to event activation, MICE events, and sports event management.',
    openGraph: seo.ogImage ? {
      images: [{ url: seo.ogImage }],
    } : undefined,
    alternates: seo.canonicalUrl ? {
      canonical: seo.canonicalUrl,
    } : undefined,
  };
}

export default async function ProductPage() {
  // Fetch CMS content for Product page
  const cmsContent = await getPageContent('product')

  // Extract hero content from CMS or use defaults
  const heroBlock = cmsContent?.blocks.find(
    (block) => block.section === 'hero' && block.key === 'main'
  )

  // Fetch image grid items
  const imageGridItems = await getImageGrid('product', 'hero_grid')

  const heroData = {
    heading: heroBlock?.content?.heading || "Excellence in Action",
    subheading: heroBlock?.content?.subheading || "Delivering success through innovation and integrity.",
    description: heroBlock?.content?.description || "We create remarkable guest experiences by combining creative vision with precise execution. Our focus on innovation and integrity ensures that every event brings your vision to life.",
    imageGridItems,
  }

  return (
    <div className="flex flex-col">
      <ProductHero {...heroData} />
    </div>
  )
}