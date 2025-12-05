
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    console.error('URL:', !!supabaseUrl);
    console.error('Key:', !!supabaseServiceKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ARTIFACTS_DIR = '/Users/eriksupit/.gemini/antigravity/brain/8e9e340e-7345-4a84-9da0-b5964c0a227e';

const CONFIG = {
    about: { maxItems: 6, image: 'mockup_about_1764904826769.png' },
    product: { maxItems: 6, image: 'mockup_product_1764904842280.png' },
    services: { maxItems: 6, image: 'mockup_services_1764904859431.png' },
    collaboration: { maxItems: 4, image: 'mockup_collaboration_1764904874160.png' },
};

async function uploadImage(filePath: string, fileName: string) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const { data, error } = await supabase.storage
            .from('cms-images')
            .upload(`seeds/${fileName}`, fileContent, {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('cms-images')
            .getPublicUrl(`seeds/${fileName}`);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        return null;
    }
}

async function seedHero() {
    console.log('Starting hero grid seeding...');

    for (const [page, config] of Object.entries(CONFIG)) {
        console.log(`Processing ${page}...`);

        // 1. Get current count
        const { count, error: countError } = await supabase
            .from('cms_image_grid_items')
            .select('*', { count: 'exact', head: true })
            .eq('page_slug', page);

        if (countError) {
            console.error(`Error counting items for ${page}:`, countError);
            continue;
        }

        const currentCount = count || 0;
        const needed = config.maxItems - currentCount;

        if (needed <= 0) {
            console.log(`  ${page} is full (${currentCount}/${config.maxItems}). Skipping.`);
            continue;
        }

        console.log(`  ${page} needs ${needed} items.`);

        // 2. Upload image
        const imagePath = path.join(ARTIFACTS_DIR, config.image);
        const imageUrl = await uploadImage(imagePath, `${page}-seed.png`);

        if (!imageUrl) {
            console.error(`  Failed to upload image for ${page}. Skipping insertion.`);
            continue;
        }

        // 3. Insert items
        const newItems = [];
        for (let i = 0; i < needed; i++) {
            newItems.push({
                page_slug: page,
                section: 'hero_grid',
                slug: `${page}-hero-${currentCount + i + 1}`,
                label: `${page.charAt(0).toUpperCase() + page.slice(1)} Feature ${currentCount + i + 1}`,
                label_line_1: 'Generated Content',
                label_line_2: 'Placeholder',
                image_url: imageUrl,
                position: currentCount + i + 1,
            });
        }

        const { error: insertError } = await supabase
            .from('cms_image_grid_items')
            .insert(newItems);

        if (insertError) {
            console.error(`  Error inserting items for ${page}:`, insertError);
        } else {
            console.log(`  Successfully added ${needed} items to ${page}.`);
        }
    }

    console.log('Seeding complete!');
}

seedHero();
