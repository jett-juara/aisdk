-- Seed initial CMS pages
-- This ensures cms_pages table has entries for all marketing pages

INSERT INTO public.cms_pages (slug, title, description, status)
VALUES
    ('about', 'About Us', 'Learn about JUARA Events', 'published'),
    ('product', 'Our Products', 'Explore our event management products', 'published'),
    ('services', 'Our Services', 'Discover our comprehensive event services', 'published'),
    ('collaboration', 'Collaboration', 'Partner with us for your next event', 'published')
ON CONFLICT (slug) DO NOTHING;
