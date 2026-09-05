-- =============================================================================
-- Kisan Procurement Management System - Unified PostgreSQL Database Schema
-- SIH Project - Production Schema
-- =============================================================================

-- 1. Users Table (Core Authentication & Role Management)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer', 'admin', 'officer')),
    address TEXT,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmers Table (Extended Farmer Profiles)
CREATE TABLE IF NOT EXISTS farmers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. KP-2026-8821
    land_area NUMERIC(8,2) DEFAULT 0.00, -- Land area in Acres
    crops TEXT, -- e.g. "Paddy, Wheat, Mustard"
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    bank_name VARCHAR(255) DEFAULT 'State Bank of India',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buyers Table (Procurement Agencies / Commercial Buyers)
CREATE TABLE IF NOT EXISTS buyers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products / Crops Catalogue (Official MSP Benchmark)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Grains',
    description TEXT,
    minimum_support_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50) NOT NULL DEFAULT 'Quintals',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Procurement Listings (Farmer Sales Listings)
CREATE TABLE IF NOT EXISTS procurement_listings (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    crop_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    expected_price NUMERIC(10,2) NOT NULL CHECK (expected_price >= 0),
    location TEXT NOT NULL,
    quality_grade VARCHAR(50) DEFAULT 'FAQ Grade A',
    harvest_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'approved', 'sold', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Procurement Orders (Purchase Agreements between Farmers & Buyers)
CREATE TABLE IF NOT EXISTS procurement_orders (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES procurement_listings(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    agreed_price NUMERIC(10,2) NOT NULL CHECK (agreed_price >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'accepted', 'rejected', 'processing', 'completed', 'cancelled')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Payments Table (Direct Benefit Transfer & Order Payments)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES procurement_orders(id) ON DELETE SET NULL,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    procurement_id INTEGER, -- Links optionally to mandi procurement_records
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) DEFAULT 'Direct Bank Transfer (DBT)',
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed', 'PAYMENT_PROCESSING', 'PAID', 'PAYMENT_PENDING')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    bank_name VARCHAR(255) DEFAULT 'State Bank of India',
    account_masked VARCHAR(50) DEFAULT 'XXXXXX4920',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Notification',
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Government Procurement Centres (Mandis / PACS)
CREATE TABLE IF NOT EXISTS procurement_centres (
    id SERIAL PRIMARY KEY,
    centre_name VARCHAR(255) NOT NULL,
    centre_code VARCHAR(50) UNIQUE NOT NULL,
    location TEXT,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    capacity INTEGER DEFAULT 160,
    opening_time VARCHAR(20) DEFAULT '08:00 AM',
    closing_time VARCHAR(20) DEFAULT '06:00 PM',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Procurement Slots (Mandi Gate Pass)
CREATE TABLE IF NOT EXISTS procurement_slots (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    centre_id INTEGER NOT NULL REFERENCES procurement_centres(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(50) NOT NULL,
    token_number VARCHAR(50) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    estimated_quantity NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'BOOKED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Queue Table (Mandi Electronic Weighbridge Queue)
CREATE TABLE IF NOT EXISTS queues (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    centre_id INTEGER NOT NULL REFERENCES procurement_centres(id) ON DELETE CASCADE,
    slot_id INTEGER REFERENCES procurement_slots(id) ON DELETE CASCADE,
    token_number VARCHAR(50) NOT NULL,
    queue_number INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'WAITING',
    estimated_wait_time INTEGER DEFAULT 35,
    weighbridge VARCHAR(50) DEFAULT 'WB-02',
    vehicle_number VARCHAR(50) DEFAULT 'UP14-AB-1234',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Procurement Records (Weighment J-Form)
CREATE TABLE IF NOT EXISTS procurement_records (
    id SERIAL PRIMARY KEY,
    weighment_slip_no VARCHAR(50) UNIQUE NOT NULL,
    farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    centre_id INTEGER NOT NULL REFERENCES procurement_centres(id) ON DELETE CASCADE,
    slot_id INTEGER REFERENCES procurement_slots(id) ON DELETE SET NULL,
    crop VARCHAR(100) NOT NULL,
    gross_weight NUMERIC(10,2) NOT NULL,
    tare_weight NUMERIC(10,2) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL, -- Net Weight
    unit VARCHAR(20) DEFAULT 'Quintals',
    quality_grade VARCHAR(50) DEFAULT 'FAQ Grade A',
    moisture_content NUMERIC(5,2) DEFAULT 11.8,
    rate NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    procurement_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- High-Performance Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_buyers_user_id ON buyers(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_crop_status ON procurement_listings(crop_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_farmer ON procurement_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON procurement_orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON procurement_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_slots_centre_date ON procurement_slots(centre_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_queue_centre_status ON queues(centre_id, status);
