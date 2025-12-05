
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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ARTIFACTS_DIR = '/Users/eriksupit/.gemini/antigravity/brain/8e9e340e-7345-4a84-9da0-b5964c0a227e';

// Map positions to images
// 1: Audience Flow
// 2: Creative Agency
// 3: Event Activation (Generic)
// 4: MICE Event (Generic)
// 5: Music Concert (Generic)
// 6: Sport Event (Generic)
const PRODUCT_IMAGES = {
    1: 'product_audience_flow_1764905445885.png',
    2: 'product_creative_agency_1764905464805.png',
    3: 'mockup_product_1764904842280.png',
    4: 'mockup_product_1764904842280.png',
    5: 'mockup_product_1764904842280.png',
    6: 'mockup_product_1764904842280.png',
};

async function uploadImage(filePath: string, fileName: string) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return null;
        }
        const fileContent = fs.readFileSync(filePath);
        const { data, error } = await supabase.storage
            .from('cms-images')
            .upload(`product/${fileName}`, fileContent, {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('cms-images')
            .getPublicUrl(`product/${fileName}`);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        return null;
    }
}

async function updateProductHero() {
    console.log('Starting product hero update...');

    // Upload images first and get URLs
    const uploadedUrls: Record<string, string> = {};

    for (const [pos, filename] of Object.entries(PRODUCT_IMAGES)) {
        if (uploadedUrls[filename]) continue; // Skip if already uploaded

        console.log(`Uploading ${filename}...`);
        const imagePath = path.join(ARTIFACTS_DIR, filename);
        const url = await uploadImage(imagePath, filename);

        if (url) {
            uploadedUrls[filename] = url;
        }
    }

    // Update database items
    for (const [pos, filename] of Object.entries(PRODUCT_IMAGES)) {
        const url = uploadedUrls[filename];
        if (!url) {
            console.error(`Skipping position ${pos} because image upload failed.`);
            continue;
        }

        console.log(`Updating position ${pos} with image...`);

        // Check if item exists at this position
        const { data: existing } = await supabase
            .from('cms_image_grid_items')
            .select('id')
            .eq('page_slug', 'product')
            .eq('position', parseInt(pos))
            .single();

        if (existing) {
            // Update
            const { error } = await supabase
                .from('cms_image_grid_items')
                .update({ image_url: url })
                .eq('id', existing.id);

            if (error) console.error(`Error updating pos ${pos}:`, error);
            else console.log(`Updated pos ${pos}.`);
        } else {
            // Insert (shouldn't happen if seeded, but good fallback)
            const { error } = await supabase
                .from('cms_image_grid_items')
                .insert({
                    page_slug: 'product',
                    section: 'hero_grid',
                    slug: `product-hero-${pos}`,
                    label: `Product Feature ${pos}`,
                    image_url: url,
                    position: parseInt(pos)
                });
            if (error) console.error(`Error inserting pos ${pos}:`, error);
            else console.log(`Inserted pos ${pos}.`);
        }
    }

    console.log('Product update complete!');
}

updateProductHero();
