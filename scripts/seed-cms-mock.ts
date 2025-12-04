/**
 * CMS Mock Data Seed Script
 *
 * This script populates the CMS tables with sample data for testing.
 * Run with: npx tsx scripts/seed-cms-mock.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env" }); // Use .env instead of .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Placeholder images from Unsplash (free to use)
const MOCK_IMAGES = {
  events:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
  community:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  analytics:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  services1:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  services2:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
  services3:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
};

async function seedCMS() {
  console.log("🌱 Starting CMS mock data seed...\n");

  try {
    // 1. Create/update pages
    console.log("📄 Creating pages...");
    const pages = [
      {
        slug: "about",
        title: "About",
        status: "published",
        meta_title:
          "About JUARA - Leading Event Management Company in Indonesia",
        meta_description:
          "Discover JUARA's story as a premier event organizer with 15+ years of experience creating exceptional events across Indonesia. Learn about our values and commitment.",
      },
      {
        slug: "product",
        title: "Product",
        status: "published",
        meta_title: "JUARA Event Services - Premium Event Management Solutions",
        meta_description:
          "Explore JUARA's comprehensive event management services and solutions. From corporate events to experiential marketing, we deliver excellence.",
      },
      {
        slug: "services",
        title: "Services",
        status: "published",
        meta_title:
          "Professional Event Services by JUARA - Full Service Event Production",
        meta_description:
          "JUARA offers complete event production services including planning, coordination, and execution. Trust our expertise for your next event.",
      },
    ];

    for (const page of pages) {
      const { error } = await supabase
        .from("cms_pages")
        .upsert(page, { onConflict: "slug" });

      if (error) throw error;
      console.log(`  ✅ ${page.title} page`);
    }

    // 2. Seed About page image grid
    console.log("\n🖼️  Seeding About page image grid...");
    const aboutGridItems = [
      {
        page_slug: "about",
        section: "hero_grid",
        slug: "events",
        label: "Events",
        label_line_1: "Premium Event",
        label_line_2: "Experiences",
        image_url: MOCK_IMAGES.events,
        image_position: "left",
        position: 1,
        alt_text:
          "JUARA Events - Premium event experiences with professional event management and coordination",
      },
      {
        page_slug: "about",
        section: "hero_grid",
        slug: "community",
        label: "Community",
        label_line_1: "Building Connections",
        label_line_2: "Together",
        image_url: MOCK_IMAGES.community,
        image_position: "right",
        position: 2,
        alt_text:
          "JUARA Community - Building meaningful connections through collaborative event experiences",
      },
      {
        page_slug: "about",
        section: "hero_grid",
        slug: "tech",
        label: "Tech",
        label_line_1: "Innovation",
        label_line_2: "Driven",
        image_url: MOCK_IMAGES.tech,
        image_position: "left",
        position: 3,
        alt_text:
          "JUARA Tech - Innovation-driven event solutions with cutting-edge technology integration",
      },
      {
        page_slug: "about",
        section: "hero_grid",
        slug: "analytics",
        label: "Analytics",
        label_line_1: "Data",
        label_line_2: "Insights",
        image_url: MOCK_IMAGES.analytics,
        image_position: "right",
        position: 4,
        alt_text:
          "JUARA Analytics - Data-driven insights and performance metrics for successful events",
      },
    ];

    // Delete existing about grid items
    await supabase
      .from("cms_image_grid_items")
      .delete()
      .eq("page_slug", "about");

    // Insert new items
    const { error: aboutError } = await supabase
      .from("cms_image_grid_items")
      .insert(aboutGridItems);

    if (aboutError) throw aboutError;
    console.log(`  ✅ Inserted ${aboutGridItems.length} items for About page`);

    // 3. Seed Product page image grid
    console.log("\n🖼️  Seeding Product page image grid...");
    const productGridItems = [
      {
        page_slug: "product",
        section: "hero_grid",
        slug: "excellence",
        label: "Excellence",
        label_line_1: "Premium",
        label_line_2: "Quality",
        image_url: MOCK_IMAGES.events,
        image_position: "left",
        position: 1,
        alt_text:
          "JUARA Excellence - Premium quality event management with exceptional attention to detail",
      },
      {
        page_slug: "product",
        section: "hero_grid",
        slug: "innovation",
        label: "Innovation",
        label_line_1: "Creative",
        label_line_2: "Solutions",
        image_url: MOCK_IMAGES.tech,
        image_position: "right",
        position: 2,
        alt_text:
          "JUARA Innovation - Creative event solutions with innovative approaches and technologies",
      },
    ];

    await supabase
      .from("cms_image_grid_items")
      .delete()
      .eq("page_slug", "product");

    const { error: productError } = await supabase
      .from("cms_image_grid_items")
      .insert(productGridItems);

    if (productError) throw productError;
    console.log(
      `  ✅ Inserted ${productGridItems.length} items for Product page`,
    );

    // 4. Seed Services page image grid
    console.log("\n🖼️  Seeding Services page image grid...");
    const servicesGridItems = [
      {
        page_slug: "services",
        section: "hero_grid",
        slug: "planning",
        label: "Planning",
        label_line_1: "Strategic",
        label_line_2: "Execution",
        image_url: MOCK_IMAGES.services1,
        image_position: "left",
        position: 1,
        alt_text:
          "JUARA Planning - Strategic event planning with meticulous attention to detail and flawless execution",
      },
      {
        page_slug: "services",
        section: "hero_grid",
        slug: "coordination",
        label: "Coordination",
        label_line_1: "Seamless",
        label_line_2: "Management",
        image_url: MOCK_IMAGES.services2,
        image_position: "right",
        position: 2,
        alt_text:
          "JUARA Coordination - Seamless event management and coordination for stress-free experiences",
      },
      {
        page_slug: "services",
        section: "hero_grid",
        slug: "delivery",
        label: "Delivery",
        label_line_1: "On-Time",
        label_line_2: "Excellence",
        image_url: MOCK_IMAGES.services3,
        image_position: "left",
        position: 3,
        alt_text:
          "JUARA Delivery - On-time event execution with excellence in every detail and professional delivery",
      },
    ];

    await supabase
      .from("cms_image_grid_items")
      .delete()
      .eq("page_slug", "services");

    const { error: servicesError } = await supabase
      .from("cms_image_grid_items")
      .insert(servicesGridItems);

    if (servicesError) throw servicesError;
    console.log(
      `  ✅ Inserted ${servicesGridItems.length} items for Services page`,
    );

    console.log("\n✨ CMS mock data seed completed successfully!");
    console.log("\n📌 Next steps:");
    console.log("  1. Run: npm run dev");
    console.log("  2. Visit: http://localhost:3000/about");
    console.log("  3. Verify: Images should display in hero grid");
    console.log("  4. Test: /setting/content to manage images");
  } catch (error) {
    console.error("\n❌ Error seeding CMS:", error);
    process.exit(1);
  }
}

seedCMS();
