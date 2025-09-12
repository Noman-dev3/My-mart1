
# My Mart E-Commerce Store

This is a Next.js e-commerce application built with Supabase, Tailwind CSS, and Genkit for AI features.

## Supabase Database Setup

To get the application running, you need to set up your Supabase database schema. Run the following SQL script in your Supabase project's SQL Editor.

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
-- Create the products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    category TEXT,
    brand TEXT,
    "stockQuantity" INTEGER DEFAULT 0,
    barcode TEXT UNIQUE,
    rating NUMERIC DEFAULT 0,
    reviews INT DEFAULT 0,
    specifications JSONB,
    "reviewsData" JSONB,
    questions JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
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


-- RLS Policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access for all users" ON products;
CREATE POLICY "Allow read access for all users" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all access for admins" ON products;
CREATE POLICY "Allow all access for admins" ON products FOR ALL USING (auth.uid() IN ( SELECT id FROM auth.users WHERE role = 'authenticated' ));


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
```
---
## Admin Panel Access

To access the admin dashboard, navigate to `/admin` and log in with the following credentials:
- **Username:** `admin`
- **Password:** `password`

These are hardcoded in the application. You can change them in `src/context/admin-auth-context.tsx`.
