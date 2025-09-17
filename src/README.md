# My Mart E-Commerce Store

This is a Next.js e-commerce application built with Supabase, Tailwind CSS, and Genkit for AI features.

## Supabase Database Setup

To get the application running, you need to set up your Supabase database schema. Run the following SQL script in your Supabase project's SQL Editor. This is the latest and definitive script required.

**Steps:**
1. Navigate to your Supabase project dashboard.
2. In the left-hand menu, click on the **SQL Editor** icon.
3. Click **"+ New query"**.
4. Copy the entire SQL script below.
5. Paste the script into the SQL Editor.
6. Click the **"RUN"** button.

---

### Database Setup SQL Script

```sql
-- Drop the old products table to remove it completely
DROP TABLE IF EXISTS products;

-- Create the new, corrected products table with snake_case column names
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    category TEXT,
    brand TEXT,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    barcode TEXT UNIQUE,
    rating NUMERIC DEFAULT 0 NOT NULL,
    reviews INT DEFAULT 0 NOT NULL,
    specifications JSONB,
    reviews_data JSONB,
    questions JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- Create the orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer JSONB,
    items JSONB,
    total NUMERIC,
    status TEXT,
    date TIMESTAMPTZ,
    "paymentMethod" TEXT
);

-- Create the site content table if it doesn't exist
CREATE TABLE IF NOT EXISTS "siteContent" (
    page TEXT PRIMARY KEY,
    content JSONB
);

-- Create the admin activity table
CREATE TABLE IF NOT EXISTS admin_activity (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_agent TEXT,
    action TEXT,
    details TEXT
);

-- RLS Policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access for all users" ON products;
CREATE POLICY "Allow read access for all users" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access for admins" ON products;
CREATE POLICY "Allow all access for admins" ON products FOR ALL USING (true);


-- RLS Policies for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own orders." ON orders;
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = (customer ->> 'uid')::uuid);
DROP POLICY IF EXISTS "Admins can view all orders." ON orders;
CREATE POLICY "Admins can view all orders." ON orders FOR ALL USING (true); -- Simplified for admin panel
DROP POLICY IF EXISTS "Users can create orders." ON orders;
CREATE POLICY "Users can create orders." ON orders FOR INSERT WITH CHECK (auth.uid() = (customer ->> 'uid')::uuid);


-- RLS Policies for siteContent table
ALTER TABLE "siteContent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site content is viewable by everyone." ON "siteContent";
CREATE POLICY "Site content is viewable by everyone." ON "siteContent" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage site content." ON "siteContent";
CREATE POLICY "Admins can manage site content." ON "siteContent" FOR ALL USING (true); -- Simplified for admin panel

-- RLS Policies for admin_activity table
ALTER TABLE admin_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage admin activity." ON admin_activity;
CREATE POLICY "Admins can manage admin activity." ON admin_activity FOR ALL USING (true);


-- Function to get distinct categories
CREATE OR REPLACE FUNCTION get_distinct_categories()
RETURNS TABLE(category TEXT) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT p.category FROM products p WHERE p.category IS NOT NULL ORDER BY p.category;
END;
$$ LANGUAGE plpgsql;

-- Function to get distinct brands
CREATE OR REPLACE FUNCTION get_distinct_brands()
RETURNS TABLE(brand TEXT) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT p.brand FROM products p WHERE p.brand IS NOT NULL ORDER BY p.brand;
END;
$$ LANGUAGE plpgsql;


-- Add tables to the publication for real-time updates
-- This might fail if the tables are already added, which is safe to ignore.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
EXCEPTION
  WHEN duplicate_object THEN
    -- do nothing
END;
$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION
  WHEN duplicate_object THEN
    -- do nothing
END;
$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "siteContent";
EXCEPTION
  WHEN duplicate_object THEN
    -- do nothing
END;
$$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE admin_activity;
EXCEPTION
  WHEN duplicate_object THEN
    -- do nothing
END;
$$;


-- Create a new storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop old policies if they exist to avoid conflicts.
-- These might fail if they were never created, which is safe to ignore.
DROP POLICY IF EXISTS "Admin Manage Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow inserts for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes for authenticated users" ON storage.objects;

-- The bucket is public for reads.
-- For writes (uploads), we will use an authenticated server action,
-- which uses the service_role key and bypasses RLS for storage.
-- Therefore, we no longer need to create complex RLS policies on the storage.objects table.
```
---
## Admin Panel Access

To access the admin dashboard, navigate to any page under `/admin` (e.g., `/admin/products`). You will be prompted to log in. The credentials can be changed in the Admin Settings page.

| Username    | Password        |
| ----------- | --------------- |
| `admin`     | `superadmin123` |
```
