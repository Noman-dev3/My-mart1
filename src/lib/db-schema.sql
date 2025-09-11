
-- =================================================================
-- PRODUCTS TABLE
-- =================================================================

-- Create the products table
CREATE TABLE products (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    image text,
    category text,
    brand text,
    inStock boolean DEFAULT true NOT NULL,
    rating numeric DEFAULT 0,
    reviews integer DEFAULT 0,
    specifications jsonb,
    reviewsData jsonb,
    questions jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Real-time for the products table
ALTER TABLE public.products REPLICA IDENTITY FULL;
-- create publication for the table
CREATE PUBLICATION supabase_realtime FOR TABLE public.products;


-- =================================================================
-- ORDERS TABLE
-- =================================================================

-- Create the orders table
CREATE TABLE orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    customer jsonb,
    items jsonb,
    total numeric NOT NULL,
    status text DEFAULT 'Pending'::text,
    date timestamp with time zone DEFAULT now() NOT NULL,
    paymentMethod text
);

-- Enable Real-time for the orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;
-- create publication for the table
CREATE PUBLICATION supabase_realtime_orders FOR TABLE public.orders;


-- =================================================================
-- SITE CONTENT TABLE
-- =================================================================

-- Create the siteContent table
CREATE TABLE "siteContent" (
    page text NOT NULL PRIMARY KEY,
    content jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Real-time for the siteContent table
ALTER TABLE public."siteContent" REPLICA IDENTITY FULL;
-- create publication for the table
CREATE PUBLICATION supabase_realtime_content FOR TABLE public."siteContent";


-- =================================================================
-- HELPER FUNCTIONS
-- =================================================================

-- Function to get distinct categories from the products table
CREATE OR REPLACE FUNCTION get_distinct_categories()
RETURNS TABLE(category text) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.category
    FROM public.products p
    ORDER BY p.category;
END;
$$ LANGUAGE plpgsql;

-- Function to get distinct brands from the products table
CREATE OR REPLACE FUNCTION get_distinct_brands()
RETURNS TABLE(brand text) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.brand
    FROM public.products p
    ORDER BY p.brand;
END;
$$ LANGUAGE plpgsql;
