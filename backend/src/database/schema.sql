-- =============================================================================
-- Kisan Procurement Platform - PostgreSQL Database Schema
-- Normalized 8 Entities: Farmers, Centres, Slots, Queues, Procurements, Payments, Notifications, Admins
-- =============================================================================

-- 1. Admins / Officials Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    centre_code VARCHAR(100) DEFAULT 'MANDI-GZB-01',
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmers Table
CREATE TABLE IF NOT EXISTS farmers (
    id SERIAL PRIMARY KEY,
    farmer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    aadhaar_last4 VARCHAR(4),
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    land_acres NUMERIC(8,2) DEFAULT 0.00,
    primary_crop VARCHAR(100) DEFAULT 'Paddy (Rice)',
    estimated_quantity NUMERIC(10,2) DEFAULT 0.00,
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    bank_name VARCHAR(255) DEFAULT 'State Bank of India',
    status VARCHAR(50) DEFAULT 'VERIFIED',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Procurement Centres (Mandis / PACS) Table
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

-- 4. Procurement Slots Table
CREATE TABLE IF NOT EXISTS procurement_slots (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    centre_id INTEGER REFERENCES procurement_centres(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(50) NOT NULL,
    token_number VARCHAR(50) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    estimated_quantity NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'BOOKED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Queue Table
CREATE TABLE IF NOT EXISTS queues (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    centre_id INTEGER REFERENCES procurement_centres(id) ON DELETE CASCADE,
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

-- 6. Procurement Records (Weighment & Quality) Table
CREATE TABLE IF NOT EXISTS procurement_records (
    id SERIAL PRIMARY KEY,
    weighment_slip_no VARCHAR(50) UNIQUE NOT NULL,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    centre_id INTEGER REFERENCES procurement_centres(id) ON DELETE CASCADE,
    slot_id INTEGER REFERENCES procurement_slots(id) ON DELETE SET NULL,
    crop VARCHAR(100) NOT NULL,
    gross_weight NUMERIC(10,2) NOT NULL,
    tare_weight NUMERIC(10,2) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL, -- Net Weight in Quintals
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

-- 7. Payments Table (Direct Benefit Transfer - DBT)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    procurement_id INTEGER REFERENCES procurement_records(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PAYMENT_PROCESSING',
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    bank_name VARCHAR(255) DEFAULT 'State Bank of India',
    account_masked VARCHAR(50) DEFAULT 'XXXXXX4920',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Indexes for High Performance Query Execution
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_slots_centre_date ON procurement_slots(centre_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_slots_farmer ON procurement_slots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_queue_centre_status ON queues(centre_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_farmer ON queues(farmer_id);
CREATE INDEX IF NOT EXISTS idx_procurement_farmer ON procurement_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_procurement_centre ON procurement_records(centre_id);
CREATE INDEX IF NOT EXISTS idx_payments_farmer ON payments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_farmer ON notifications(farmer_id);
