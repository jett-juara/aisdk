/**
 * CMS Marketing Content Helpers
 * Functions to read CMS data for marketing pages
 */

import { createSupabaseRSCClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export type PageSlug = "about" | "product" | "services" | "collaboration";

export interface PageContent {
  slug: PageSlug;
  title: string;
  description: string;
  status: "draft" | "review" | "published" | "archived";
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  section: string;
  key: string;
  type: string;
  content: Record<string, any>;
}

export interface ImageGridItem {
  id: string;
  slug: string;
  label: string;
  labelLine1: string | null;
  labelLine2: string | null;
  iconName: string | null;
  imageUrl: string | null;
  imagePosition: "left" | "right" | null;
  position: number;
  altText: string | null;
}

export interface PageSeo {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
}

export interface DetailBlock {
  id: string;
  pageSlug: PageSlug;
  itemSlug: string;
  title: string;
  paragraphs: string[];
  imageUrl?: string;
  altText?: string;
  status: "draft" | "review" | "published" | "archived";
  position: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get page content with all associated content blocks
 * @param pageSlug - The page identifier
 * @returns Page content with blocks, or null if not found
 */
export async function getPageContent(
  pageSlug: PageSlug,
): Promise<PageContent | null> {
  const supabase = await createSupabaseRSCClient();

  // Fetch page metadata
  const { data: page, error: pageError } = await supabase
    .from("cms_pages")
    .select("slug, title, description, status")
    .eq("slug", pageSlug)
    .single();

  if (pageError?.code === "PGRST116" || !page) {
    // Data belum ada; biarkan caller pakai fallback tanpa error noise
    return null;
  }
  if (pageError) {
    console.error(`Failed to fetch page: ${pageSlug}`, pageError);
    return null;
  }

  // Fetch associated content blocks
  const { data: blocks, error: blocksError } = await supabase
    .from("cms_content_blocks")
    .select("id, section, key, type, content")
    .eq("page_slug", pageSlug)
    .order("section", { ascending: true })
    .order("key", { ascending: true });

  if (blocksError) {
    console.error(
      `Failed to fetch content blocks for: ${pageSlug}`,
      blocksError,
    );
    return {
      ...page,
      blocks: [],
    };
  }

  return {
    ...page,
    blocks: blocks || [],
  };
}

/**
 * Get image grid items for a specific page and section
 * @param pageSlug - The page identifier
 * @param section - Optional section filter (defaults to 'hero_grid')
 * @returns Array of image grid items ordered by position
 */
export async function getImageGrid(
  pageSlug: PageSlug,
  section: string = "hero_grid",
): Promise<ImageGridItem[]> {
  const supabase = await createSupabaseRSCClient();

  const { data, error } = await supabase
    .from("cms_image_grid_items")
    .select(
      "id, slug, label, label_line_1, label_line_2, icon_name, image_url, image_position, position, alt_text",
    )
    .eq("page_slug", pageSlug)
    .eq("section", section)
    .order("position", { ascending: true });

  if (error) {
    console.error(
      `Failed to fetch image grid for: ${pageSlug}/${section}`,
      error,
    );
    return [];
  }

  // Map snake_case to camelCase
  return (data || []).map((item) => ({
    id: item.id,
    slug: item.slug,
    label: item.label,
    labelLine1: item.label_line_1,
    labelLine2: item.label_line_2,
    iconName: item.icon_name,
    imageUrl: item.image_url,
    imagePosition: item.image_position,
    position: item.position,
    altText: item.alt_text,
  }));
}

/**
 * Get SEO metadata for a specific page
 * @param pageSlug - The page identifier
 * @returns Page SEO metadata or null values if not found
 */
export async function getPageSeo(pageSlug: PageSlug): Promise<PageSeo> {
  const supabase = await createSupabaseRSCClient();

  const { data, error } = await supabase
    .from("cms_pages")
    .select("meta_title, meta_description, og_image_url, canonical_url")
    .eq("slug", pageSlug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    console.error(`Failed to fetch SEO metadata for: ${pageSlug}`, error);
    return {
      title: null,
      description: null,
      ogImage: null,
      canonicalUrl: null,
    };
  }

  return {
    title: data.meta_title,
    description: data.meta_description,
    ogImage: data.og_image_url,
    canonicalUrl: data.canonical_url,
  };
}

/**
 * Get a specific content block by key
 * @param pageSlug - The page identifier
 * @param section - The section identifier
 * @param key - The block key
 * @returns Content block or null if not found
 */
export async function getContentBlock(
  pageSlug: PageSlug,
  section: string,
  key: string,
): Promise<ContentBlock | null> {
  const supabase = await createSupabaseRSCClient();

  const { data, error } = await supabase
    .from("cms_content_blocks")
    .select("id, section, key, type, content")
    .eq("page_slug", pageSlug)
    .eq("section", section)
    .eq("key", key)
    .single();

  if (error || !data) {
    console.error(
      `Failed to fetch content block: ${pageSlug}/${section}/${key}`,
      error,
    );
    return null;
  }

  return data;
}

/**
 * Check if a page is published
 * @param pageSlug - The page identifier
 * @returns True if page is published, false otherwise
 */
export async function isPagePublished(pageSlug: PageSlug): Promise<boolean> {
  const supabase = await createSupabaseRSCClient();

  const { data, error } = await supabase
    .from("cms_pages")
    .select("status")
    .eq("slug", pageSlug)
    .single();

  if (error || !data) {
    return false;
  }

  return data.status === "published";
}

/**
 * Get detail blocks for a page (published only)
 * @param pageSlug - The page identifier
 * @returns Array of detail blocks ordered by position
 */
export async function getDetailBlocks(
  pageSlug: PageSlug,
): Promise<DetailBlock[]> {
  const supabase = await createSupabaseRSCClient();

  const { data, error } = await supabase
    .from("cms_detail_blocks")
    .select(
      "id, page_slug, item_slug, title, paragraphs, image_url, alt_text, status, position",
    )
    .eq("page_slug", pageSlug)
    .eq("status", "published")
    .order("position", { ascending: true });

  if (error) {
    console.error(`Failed to fetch detail blocks for: ${pageSlug}`, error);
    return [];
  }

  return (data || []).map((item) => ({
    id: item.id,
    pageSlug: item.page_slug as PageSlug,
    itemSlug: item.item_slug,
    title: item.title,
    paragraphs: Array.isArray(item.paragraphs) ? item.paragraphs : [],
    imageUrl: item.image_url ?? undefined,
    altText: item.alt_text ?? undefined,
    status: item.status,
    position: item.position,
  }));
}
