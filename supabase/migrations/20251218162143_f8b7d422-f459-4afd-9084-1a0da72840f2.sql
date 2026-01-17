-- Add new columns to villas table
ALTER TABLE public.villas 
ADD COLUMN IF NOT EXISTS price_hourly numeric DEFAULT 1500,
ADD COLUMN IF NOT EXISTS map_coordinates jsonb DEFAULT '{"lat": 19.0760, "lng": 72.8777}'::jsonb,
ADD COLUMN IF NOT EXISTS media_gallery jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 4.5;

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id UUID REFERENCES public.villas(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Anyone can create reviews
CREATE POLICY "Anyone can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);

-- Add booking_type column to bookings if not exists
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'nightly';

-- Update existing villas with full data
UPDATE public.villas SET 
  price_hourly = 1500,
  map_coordinates = '{"lat": 15.2993, "lng": 74.1240}'::jsonb,
  media_gallery = '[{"type": "image", "url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"}, {"type": "video", "url": "https://www.w3schools.com/html/mov_bbb.mp4"}]'::jsonb,
  avg_rating = 4.8
WHERE name = 'Green Haven Villa';

UPDATE public.villas SET 
  price_hourly = 1200,
  map_coordinates = '{"lat": 18.7546, "lng": 73.4062}'::jsonb,
  media_gallery = '[{"type": "image", "url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800"}]'::jsonb,
  avg_rating = 4.6
WHERE name = 'The Rustic Farmhouse';

UPDATE public.villas SET 
  price_hourly = 2200,
  map_coordinates = '{"lat": 9.4981, "lng": 76.3388}'::jsonb,
  media_gallery = '[{"type": "image", "url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"}, {"type": "video", "url": "https://www.w3schools.com/html/mov_bbb.mp4"}]'::jsonb,
  avg_rating = 4.9
WHERE name = 'Emerald Retreat';

UPDATE public.villas SET 
  price_hourly = 1800,
  map_coordinates = '{"lat": 32.2396, "lng": 77.1887}'::jsonb,
  media_gallery = '[{"type": "image", "url": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}]'::jsonb,
  avg_rating = 4.7
WHERE name = 'Hilltop Whispers';

UPDATE public.villas SET 
  price_hourly = 2500,
  map_coordinates = '{"lat": 18.6298, "lng": 72.8798}'::jsonb,
  media_gallery = '[{"type": "image", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"}]'::jsonb,
  avg_rating = 4.9
WHERE name = 'Serenity Stay';

UPDATE public.villas SET 
  price_hourly = 2000,
  map_coordinates = '{"lat": 26.9124, "lng": 75.7873}'::jsonb,
  media_gallery = '[{"type": "image", "url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}, {"type": "image", "url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"}]'::jsonb,
  avg_rating = 4.5
WHERE name = 'Heritage Courtyard';

-- Insert sample reviews
INSERT INTO public.reviews (villa_id, user_name, rating, comment) 
SELECT id, 'Priya Sharma', 5, 'Absolutely stunning property! The pool was amazing and the beach access made our vacation perfect.'
FROM public.villas WHERE name = 'Green Haven Villa';

INSERT INTO public.reviews (villa_id, user_name, rating, comment) 
SELECT id, 'Rahul Verma', 4, 'Great location and amenities. The staff was very helpful. Would definitely visit again.'
FROM public.villas WHERE name = 'Green Haven Villa';

INSERT INTO public.reviews (villa_id, user_name, rating, comment) 
SELECT id, 'Anita Patel', 5, 'Perfect getaway spot! Loved the rustic charm and the fireplace was so cozy.'
FROM public.villas WHERE name = 'The Rustic Farmhouse';

INSERT INTO public.reviews (villa_id, user_name, rating, comment) 
SELECT id, 'Vikram Singh', 5, 'The backwater views are breathtaking. Best spa experience ever!'
FROM public.villas WHERE name = 'Emerald Retreat';

INSERT INTO public.reviews (villa_id, user_name, rating, comment) 
SELECT id, 'Sneha Gupta', 4, 'Beautiful mountain views. The bonfire night was magical.'
FROM public.villas WHERE name = 'Hilltop Whispers';

INSERT INTO public.reviews (villa_id, user_name, rating, comment) 
SELECT id, 'Arjun Reddy', 5, 'Luxury at its finest. The jacuzzi and pool were incredible!'
FROM public.villas WHERE name = 'Serenity Stay';

INSERT INTO public.reviews (villa_id, user_name, rating, comment) 
SELECT id, 'Meera Joshi', 5, 'Authentic heritage experience. The traditional decor is stunning.'
FROM public.villas WHERE name = 'Heritage Courtyard';