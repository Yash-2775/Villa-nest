-- Create villas table
CREATE TABLE public.villas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price_per_night NUMERIC NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  main_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on villas (public read, admin write)
ALTER TABLE public.villas ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read villas
CREATE POLICY "Villas are publicly readable"
ON public.villas
FOR SELECT
USING (true);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create bookings
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id);

-- Seed the villas table with dummy data
INSERT INTO public.villas (name, type, description, location, price_per_night, amenities, main_image_url) VALUES
(
  'Green Haven Villa',
  'Villa',
  'A stunning tropical paradise featuring a private infinity pool overlooking lush gardens. This luxurious villa offers the perfect blend of modern comfort and natural beauty, with direct beach access just steps away.',
  'Goa',
  15000,
  ARRAY['Private Pool', 'Beach Access', 'AC', 'WiFi'],
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'
),
(
  'The Rustic Farmhouse',
  'Farmhouse',
  'Escape to this charming stone farmhouse surrounded by acres of lush greenery. Perfect for family gatherings with a spacious garden, cozy fireplace, and authentic rustic charm that takes you back to simpler times.',
  'Lonavala',
  12000,
  ARRAY['Large Garden', 'Fireplace', 'BBQ Grill', 'Pet Friendly'],
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800'
),
(
  'Emerald Retreat',
  'Villa',
  'Experience the serene Kerala backwaters from this traditional-style villa. Wake up to mesmerizing waterfront views, indulge in Ayurvedic spa treatments, and savor authentic cuisine prepared by your personal chef.',
  'Kerala Backwaters',
  22000,
  ARRAY['Waterfront View', 'Ayurvedic Spa', 'Chef on Call', 'AC'],
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800'
),
(
  'Hilltop Whispers',
  'Cottage',
  'Perched high in the Himalayan mountains, this cozy wooden cottage offers breathtaking panoramic views. Enjoy starlit bonfires, crisp mountain air, and the peaceful solitude of nature at its finest.',
  'Manali',
  18000,
  ARRAY['Mountain View', 'Heater', 'Balcony', 'Bonfire'],
  'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800'
),
(
  'Serenity Stay',
  'Villa',
  'A contemporary luxury villa featuring sleek modern interiors, a stunning jacuzzi, and a private pool. Located near the jetty, this property offers the perfect weekend escape with world-class amenities.',
  'Alibaug',
  25000,
  ARRAY['Jacuzzi', 'Near Jetty', 'Modern Interiors', 'Pool'],
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'
),
(
  'Heritage Courtyard',
  'Farmhouse',
  'Step into royal Rajasthani heritage at this beautifully restored haveli. With traditional decor, expansive lawns, and authentic local cuisine, experience the grandeur of a bygone era.',
  'Jaipur',
  20000,
  ARRAY['Traditional Decor', 'Large Lawn', 'Local Cuisine', 'Parking'],
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
);