/*
  # Add ticket categories, brands, airlines, and suppliers

  1. New Tables
    - `brands` - Brand management for tickets
    - `airlines` - Airline partners
    - `suppliers` - Supplier partners

  2. Table Updates
    - Add category, brand_id, airline_id, supplier_id to tickets table

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    logo_url text,
    primary_color text DEFAULT '#2563eb',
    secondary_color text DEFAULT '#64748b',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create airlines table
CREATE TABLE IF NOT EXISTS airlines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    code text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    contact_person text,
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add new columns to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('service', 'airline', 'supplier')) DEFAULT 'service',
ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id),
ADD COLUMN IF NOT EXISTS airline_id uuid REFERENCES airlines(id),
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id);

-- Enable RLS on new tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY "Everyone can read active brands" ON brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage brands" ON brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Airlines policies
CREATE POLICY "Agents and admins can read airlines" ON airlines
    FOR SELECT USING (is_admin_or_agent());

CREATE POLICY "Admins can manage airlines" ON airlines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Suppliers policies
CREATE POLICY "Agents and admins can read suppliers" ON suppliers
    FOR SELECT USING (is_admin_or_agent());

CREATE POLICY "Admins can manage suppliers" ON suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default brands
INSERT INTO brands (name, description, primary_color, secondary_color, is_active) VALUES
    ('ServiceDesk Pro', 'Main support brand for customer service', '#2563eb', '#64748b', true),
    ('Enterprise Support', 'Dedicated support for enterprise clients', '#7c3aed', '#6b7280', true)
ON CONFLICT DO NOTHING;

-- Insert default airlines
INSERT INTO airlines (name, email, code, is_active) VALUES
    ('Air Canada', 'support@aircanada.ca', 'AC', true),
    ('WestJet', 'customer.service@westjet.com', 'WS', true),
    ('ITA Airways', 'changes@itaairways.com', 'AZ', true)
ON CONFLICT DO NOTHING;

-- Insert default suppliers
INSERT INTO suppliers (name, email, contact_person, phone, is_active) VALUES
    ('Hotel Booking Solutions', 'support@hotelbooking.com', 'John Smith', '+1-800-HOTELS', true),
    ('Car Rental Partners', 'partners@carrental.com', 'Sarah Johnson', '+1-800-RENTAL', true),
    ('Travel Insurance Co', 'claims@travelinsurance.com', 'Mike Wilson', '+1-800-INSURE', true)
ON CONFLICT DO NOTHING;