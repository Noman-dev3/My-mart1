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
-- Create the products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    category TEXT,
    brand TEXT,
    "inStock" BOOLEAN DEFAULT TRUE,
    rating NUMERIC DEFAULT 0,
    reviews INT DEFAULT 0,
    specifications JSONB,
    "reviewsData" JSONB,
    questions JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer JSONB,
    items JSONB,
    total NUMERIC,
    status TEXT,
    date TIMESTAMPTZ,
    "paymentMethod" TEXT
);

-- Create the site content table
CREATE TABLE "siteContent" (
    page TEXT PRIMARY KEY,
    content JSONB
);


-- RLS Policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);
-- THIS IS THE NEW POLICY TO ADD
CREATE POLICY "Admins can manage products." ON products FOR ALL USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = (customer ->> 'uid')::uuid);
CREATE POLICY "Admins can view all orders." ON orders FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can create orders." ON orders FOR INSERT WITH CHECK (auth.uid() = (customer ->> 'uid')::uuid);
CREATE POLICY "Admins can update orders." ON orders FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for siteContent table
ALTER TABLE "siteContent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is viewable by everyone." ON "siteContent" FOR SELECT USING (true);
CREATE POLICY "Admins can manage site content." ON "siteContent" FOR ALL USING (auth.jwt() ->> 'role' = 'admin');


-- Function to get distinct categories
CREATE OR REPLACE FUNCTION get_distinct_categories()
RETURNS TABLE(category TEXT) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT p.category FROM products p ORDER BY p.category;
END;
$$ LANGUAGE plpgsql;

-- Function to get distinct brands
CREATE OR REPLACE FUNCTION get_distinct_brands()
RETURNS TABLE(brand TEXT) AS $$
BEGIN
    RETURN QUERY SELECT DISTINCT p.brand FROM products p ORDER BY p.brand;
END;
$$ LANGUAGE plpgsql;


-- Add tables to the publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE "siteContent";
```
