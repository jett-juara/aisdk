
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

// Fallback image (using the one generated for About Hero)
const FALLBACK_IMAGE = 'mockup_about_1764904826769.png';

const DETAIL_ITEMS = [
    { slug: 'event', label: 'Event' },
    { slug: 'community', label: 'Community' },
    { slug: 'tech', label: 'Tech' },
    { slug: 'analytic', label: 'Analytics' },
];

async function uploadImage(filePath: string, fileName: string) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return null;
        }
        const fileContent = fs.readFileSync(filePath);
        const { data, error } = await supabase.storage
            .from('cms-images')
            .upload(`about/detail/${fileName}`, fileContent, {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('cms-images')
            .getPublicUrl(`about/detail/${fileName}`);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        return null;
    }
}

async function updateAboutDetails() {
    console.log('Starting about details update...');

    // Upload fallback image once
    const imagePath = path.join(ARTIFACTS_DIR, FALLBACK_IMAGE);
    const imageUrl = await uploadImage(imagePath, 'about-detail-fallback.png');

    if (!imageUrl) {
        console.error('Failed to upload fallback image. Aborting.');
        return;
    }

    console.log(`Fallback image uploaded: ${imageUrl}`);

    // Update database items
    for (const item of DETAIL_ITEMS) {
        console.log(`Updating ${item.slug}...`);

        // Check if item exists
        const { data: existing } = await supabase
            .from('cms_detail_blocks')
            .select('id')
            .eq('page_slug', 'about')
            .eq('item_slug', item.slug)
            .single();

        if (existing) {
            // Update
            const { error } = await supabase
                .from('cms_detail_blocks')
                .update({ image_url: imageUrl })
                .eq('id', existing.id);

            if (error) console.error(`Error updating ${item.slug}:`, error);
            else console.log(`Updated ${item.slug}.`);
        } else {
            // Insert
            const { error } = await supabase
                .from('cms_detail_blocks')
                .insert({
                    page_slug: 'about',
                    item_slug: item.slug,
                    title: item.label, // Default title
                    paragraphs: ['Default content for ' + item.label], // Default content
                    image_url: imageUrl,
                    status: 'published',
                    position: DETAIL_ITEMS.indexOf(item) + 1
                });
            if (error) console.error(`Error inserting ${item.slug}:`, error);
            else console.log(`Inserted ${item.slug}.`);
        }
    }

    console.log('About details update complete!');
}

updateAboutDetails();
