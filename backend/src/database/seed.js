import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { pool, withTransaction } from '../config/db.js';
import runMigrations from './migrate.js';

export const seedDatabase = async () => {
  console.log('=============================================');
  console.log('Seeding PostgreSQL Database with Complete SIH Demo Data...');
  console.log('=============================================');

  // 1. Ensure migrations are up to date
  await runMigrations();

  const defaultPassword = 'farmer123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, salt);

  const buyerPassword = 'buyer123';
  const buyerHash = await bcrypt.hash(buyerPassword, salt);

  await withTransaction(async (client) => {
    // 2. Clear existing records for clean seeding
    await client.query(`
      TRUNCATE TABLE notifications, payments, procurement_records, queues, procurement_slots,
      procurement_orders, procurement_listings, products, buyers, farmers, procurement_centres, users
      RESTART IDENTITY CASCADE
    `);

    // 3. Seed Users (Admin, Buyers, Farmers)
    console.log('Seeding Users (Admin, Buyers, Farmers)...');

    // Admin User
    const adminUserRes = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, role, address, district, state)
       VALUES ($1, $2, $3, $4, 'admin', 'Krishi Bhavan', 'New Delhi', 'Delhi')
       RETURNING id`,
      ['Mandi In-Charge Officer', 'admin@kisan.gov.in', '9999900000', adminHash]
    );
    const adminUserId = adminUserRes.rows[0].id;

    // Buyer Users (3 Procurement Agencies / Commercial Buyers)
    const buyerUsersData = [
      ['Food Corporation of India (FCI)', 'procure@fci.gov.in', '9888800001', 'Barakhamba Road', 'New Delhi', 'Delhi'],
      ['ITC Agri Business Division', 'procurement@itc.in', '9888800002', 'Sector 62', 'Noida', 'Uttar Pradesh'],
      ['Adani Agri Logistics Ltd', 'agri.desk@adani.com', '9888800003', 'Adani House, Shantigram', 'Ahmedabad', 'Gujarat'],
    ];

    const buyerUserIds = [];
    for (const b of buyerUsersData) {
      const res = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role, address, district, state)
         VALUES ($1, $2, $3, $4, 'buyer', $5, $6, $7)
         RETURNING id`,
        [b[0], b[1], b[2], buyerHash, b[3], b[4], b[5]]
      );
      buyerUserIds.push(res.rows[0].id);
    }

    // Buyer Profiles
    console.log('Seeding Buyers Table...');
    const buyerIds = [];
    const buyersData = [
      [buyerUserIds[0], 'Food Corporation of India', 'FCI-CENTRAL-2026-01', 'North Zone Office, Delhi'],
      [buyerUserIds[1], 'ITC e-Choupal / Agri Business', 'ITC-AGRI-UP-9821', 'Regional Office, Noida, UP'],
      [buyerUserIds[2], 'Adani Agri Logistics', 'ADANI-LOG-IN-4412', 'Logistics Terminal, Greater Noida'],
    ];
    for (const b of buyersData) {
      const res = await client.query(
        `INSERT INTO buyers (user_id, organization_name, license_number, address)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        b
      );
      buyerIds.push(res.rows[0].id);
    }

    // 10 Farmer Users & Profiles
    console.log('Seeding 10 Farmers and User Accounts...');
    const farmersRawData = [
      ['Ramesh Singh', 'ramesh.singh@kisan.in', '9876543210', 'Near Primary School', 'Muradnagar Dehat', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8821', 2.5, 'Paddy (Rice), Wheat', 'XXXXXX4920', 'SBIN0001234'],
      ['Baldev Yadav', 'baldev.yadav@kisan.in', '9812345670', 'Main Chauraha', 'Rawli Kalan', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8822', 3.0, 'Paddy (Rice), Mustard', 'XXXXXX3301', 'PUNB0123456'],
      ['Sukhwinder Gill', 'sukhwinder.gill@kisan.in', '9789012345', 'Kisan Basti', 'Surana', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8823', 5.2, 'Paddy (Rice), Wheat', 'XXXXXX8812', 'HDFC0000987'],
      ['Harish Chandra', 'harish.chandra@kisan.in', '9654321098', 'Post Office Road', 'Niwari', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8824', 1.8, 'Paddy (Rice), Gram', 'XXXXXX1190', 'BARB0MURADN'],
      ['Manoj Kumar', 'manoj.kumar@kisan.in', '9543210987', 'Near Canal Bridge', 'Bhojpur', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8825', 4.0, 'Paddy (Rice), Mustard', 'XXXXXX7721', 'CNRB0002345'],
      ['Pritam Lal', 'pritam.lal@kisan.in', '9711223344', 'Gram Panchayat Ghar', 'Patla', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8826', 2.2, 'Paddy (Rice), Maize', 'XXXXXX5541', 'SBIN0004321'],
      ['Devendra Sharma', 'devendra.sharma@kisan.in', '9822334455', 'Bypass Road', 'Dasna', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8827', 3.5, 'Paddy (Rice), Cotton', 'XXXXXX6612', 'ICIC0001122'],
      ['Kuldeep Tyagi', 'kuldeep.tyagi@kisan.in', '9933445566', 'Morta Farm House', 'Morta', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8828', 6.0, 'Paddy (Rice), Wheat', 'XXXXXX9901', 'SBIN0008899'],
      ['Santosh Devi', 'santosh.devi@kisan.in', '9844556677', 'Station Road', 'Duhai', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8829', 1.5, 'Paddy (Rice), Mustard', 'XXXXXX2234', 'UBIN0532101'],
      ['Vijay Pal', 'vijay.pal@kisan.in', '9755667788', 'Village Chaupal', 'Abupur', 'Ghaziabad', 'Uttar Pradesh', 'KP-2026-8830', 4.5, 'Paddy (Rice), Soybean', 'XXXXXX4419', 'PUNB0987654'],
    ];

    const farmerIds = [];
    const farmerUserIds = [];

    for (const f of farmersRawData) {
      // 1. Create User
      const uRes = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role, address, village, district, state)
         VALUES ($1, $2, $3, $4, 'farmer', $5, $6, $7, $8)
         RETURNING id`,
        [f[0], f[1], f[2], passwordHash, f[3], f[4], f[5], f[6]]
      );
      const userId = uRes.rows[0].id;
      farmerUserIds.push(userId);

      // 2. Create Farmer Profile
      const fRes = await client.query(
        `INSERT INTO farmers (user_id, farmer_id, land_area, crops, bank_account_number, ifsc_code)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [userId, f[7], f[8], f[9], f[10], f[11]]
      );
      farmerIds.push(fRes.rows[0].id);
    }

    // 4. Seed Products / Crops Catalogue
    console.log('Seeding Crops/Products Catalogue...');
    const cropsData = [
      ['Paddy / धान (Grade A)', 'Grains', 'Common and Grade-A paddy for central procurement', 2200.00, 'Quintals'],
      ['Wheat / गेहूँ (Common MSP)', 'Grains', 'Standard FAQ milling grade wheat', 2275.00, 'Quintals'],
      ['Mustard / सरसों', 'Oilseeds', 'High oil content brassica seeds', 5650.00, 'Quintals'],
      ['Cotton / कपास (Medium Staple)', 'Fibre', 'Clean medium staple raw cotton', 6620.00, 'Quintals'],
      ['Gram / चना (Desi Chana)', 'Pulses', 'FAQ standard whole Bengal gram', 5440.00, 'Quintals'],
      ['Maize / मक्का', 'Coarse Cereals', 'Yellow grain maize for procurement and industrial processing', 2090.00, 'Quintals'],
      ['Soybean / सोयाबीन (Yellow)', 'Oilseeds', 'High protein yellow soybean produce', 4600.00, 'Quintals'],
    ];

    const cropIds = [];
    for (const c of cropsData) {
      const res = await client.query(
        `INSERT INTO products (name, category, description, minimum_support_price, unit)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        c
      );
      cropIds.push(res.rows[0].id);
    }

    // 5. Seed Procurement Listings
    console.log('Seeding Procurement Listings...');
    const listingsData = [
      [farmerIds[0], cropIds[0], 60.00, 2200.00, 'Muradnagar Mandi Yard, Ghaziabad', 'FAQ Grade A', 'available'],
      [farmerIds[1], cropIds[0], 45.00, 2200.00, 'Rawli Kalan, Ghaziabad', 'FAQ Grade A', 'available'],
      [farmerIds[2], cropIds[0], 80.00, 2200.00, 'Surana APMC Center, Ghaziabad', 'Super Fine', 'approved'],
      [farmerIds[3], cropIds[1], 50.00, 2275.00, 'Niwari PACS Depot, Ghaziabad', 'FAQ Grade A', 'sold'],
      [farmerIds[4], cropIds[2], 30.00, 5650.00, 'Bhojpur Mandi Complex, Ghaziabad', 'Grade A', 'sold'],
      [farmerIds[5], cropIds[5], 40.00, 2090.00, 'Patla Mandi Yard, Ghaziabad', 'Common Grade', 'available'],
      [farmerIds[6], cropIds[3], 25.00, 6620.00, 'Dasna Procurement Centre, Ghaziabad', 'Medium Staple', 'available'],
      [farmerIds[7], cropIds[1], 100.00, 2275.00, 'Morta Mandi Hub, Ghaziabad', 'FAQ Grade A', 'available'],
    ];

    const listingIds = [];
    for (const l of listingsData) {
      const res = await client.query(
        `INSERT INTO procurement_listings (farmer_id, crop_id, quantity, expected_price, location, quality_grade, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        l
      );
      listingIds.push(res.rows[0].id);
    }

    // 6. Seed Procurement Orders
    console.log('Seeding Procurement Orders...');
    const order1 = await client.query(
      `INSERT INTO procurement_orders (listing_id, farmer_id, buyer_id, quantity, agreed_price, total_amount, order_status, completed_at)
       VALUES ($1, $2, $3, 50.00, 2275.00, 113750.00, 'completed', CURRENT_TIMESTAMP)
       RETURNING id`,
      [listingIds[3], farmerIds[3], buyerIds[0]]
    );

    const order2 = await client.query(
      `INSERT INTO procurement_orders (listing_id, farmer_id, buyer_id, quantity, agreed_price, total_amount, order_status, completed_at)
       VALUES ($1, $2, $3, 30.00, 5650.00, 169500.00, 'completed', CURRENT_TIMESTAMP)
       RETURNING id`,
      [listingIds[4], farmerIds[4], buyerIds[1]]
    );

    const order3 = await client.query(
      `INSERT INTO procurement_orders (listing_id, farmer_id, buyer_id, quantity, agreed_price, total_amount, order_status)
       VALUES ($1, $2, $3, 60.00, 2200.00, 132000.00, 'processing')
       RETURNING id`,
      [listingIds[0], farmerIds[0], buyerIds[0]]
    );

    // 7. Seed Payments
    console.log('Seeding Payments Table...');
    await client.query(`
      INSERT INTO payments (order_id, farmer_id, amount, payment_method, transaction_id, payment_status, bank_name, account_masked)
      VALUES
        (${order1.rows[0].id}, ${farmerIds[3]}, 113750.00, 'Direct Bank Transfer (DBT)', 'PFMS-DBT-20260828-98214', 'successful', 'Bank of Baroda', 'XXXXXX1190'),
        (${order2.rows[0].id}, ${farmerIds[4]}, 169500.00, 'Direct Bank Transfer (DBT)', 'PFMS-DBT-20260828-98215', 'successful', 'Canara Bank', 'XXXXXX7721'),
        (${order3.rows[0].id}, ${farmerIds[0]}, 132000.00, 'Direct Bank Transfer (DBT)', 'PFMS-DBT-20260828-98216', 'pending', 'State Bank of India', 'XXXXXX4920')
    `);

    // 8. Seed Notifications
    console.log('Seeding Notifications...');
    await client.query(`
      INSERT INTO notifications (user_id, title, message, notification_type)
      VALUES
        (${farmerUserIds[0]}, 'Listing Approved', 'Your listing for 60 Qtl Paddy has been verified by the Mandi Officer.', 'LISTING_UPDATE'),
        (${farmerUserIds[0]}, 'Order Received', 'Food Corporation of India placed an order for 60 Qtl Paddy.', 'ORDER_UPDATE'),
        (${farmerUserIds[3]}, 'Payment Credited', 'DBT Payment of ₹1,13,750 transferred to your bank account. Ref: PFMS-DBT-20260828-98214.', 'PAYMENT_CREDITED'),
        (${buyerUserIds[0]}, 'Order Completed', 'Procurement order #1 for Wheat has been marked completed.', 'ORDER_UPDATE')
    `);

    // 9. Seed 4 Government Procurement Centres
    console.log('Seeding Procurement Centres (Mandis/PACS)...');
    const centresRes = await client.query(`
      INSERT INTO procurement_centres (centre_name, centre_code, location, district, state, capacity)
      VALUES
        ('APMC Mandi Yard, Muradnagar', 'MANDI-GZB-01', 'NH-58, Muradnagar, Ghaziabad', 'Ghaziabad', 'Uttar Pradesh', 160),
        ('Sahibabad Principal Mandi Complex', 'MANDI-GZB-02', 'Site-4 Industrial Area, Sahibabad', 'Ghaziabad', 'Uttar Pradesh', 200),
        ('Modinagar Cooperative Centre (PACS)', 'PACS-GZB-03', 'Tehsil Road, Modinagar', 'Ghaziabad', 'Uttar Pradesh', 120),
        ('Loni Krishi Upaj Mandi Centre', 'PACS-GZB-04', 'Pusta Road, Loni', 'Ghaziabad', 'Uttar Pradesh', 140)
      RETURNING id
    `);

    // 10. Seed Mandi Slots & Queue Records for Today
    console.log('Seeding Mandi Slots & Queues...');
    const todayStr = new Date().toISOString().split('T')[0];

    const slot1 = await client.query(
      `INSERT INTO procurement_slots (booking_id, farmer_id, centre_id, slot_date, slot_time, token_number, crop, estimated_quantity, status)
       VALUES ('BK-2026-GZB-8819', $1, 1, $2, '10:00 AM – 11:00 AM', 'A102', 'Paddy (Rice) Grade A', 60, 'WAITING')
       RETURNING id`,
      [farmerIds[0], todayStr]
    );

    const slot2 = await client.query(
      `INSERT INTO procurement_slots (booking_id, farmer_id, centre_id, slot_date, slot_time, token_number, crop, estimated_quantity, status)
       VALUES ('BK-2026-GZB-8820', $1, 1, $2, '10:00 AM – 11:00 AM', 'A103', 'Paddy (Rice) Grade A', 45, 'CALLED')
       RETURNING id`,
      [farmerIds[1], todayStr]
    );

    const slot3 = await client.query(
      `INSERT INTO procurement_slots (booking_id, farmer_id, centre_id, slot_date, slot_time, token_number, crop, estimated_quantity, status)
       VALUES ('BK-2026-GZB-8821', $1, 1, $2, '09:00 AM – 10:00 AM', 'A095', 'Paddy (Rice) Grade A', 80, 'IN_PROCUREMENT')
       RETURNING id`,
      [farmerIds[2], todayStr]
    );

    const slot4 = await client.query(
      `INSERT INTO procurement_slots (booking_id, farmer_id, centre_id, slot_date, slot_time, token_number, crop, estimated_quantity, status)
       VALUES ('BK-2026-GZB-8815', $1, 1, $2, '09:00 AM – 10:00 AM', 'A094', 'Paddy (Rice) Grade A', 50, 'COMPLETED')
       RETURNING id`,
      [farmerIds[3], todayStr]
    );

    const slot5 = await client.query(
      `INSERT INTO procurement_slots (booking_id, farmer_id, centre_id, slot_date, slot_time, token_number, crop, estimated_quantity, status)
       VALUES ('BK-2026-GZB-8814', $1, 1, $2, '09:00 AM – 10:00 AM', 'A093', 'Paddy (Rice) Grade A', 70, 'COMPLETED')
       RETURNING id`,
      [farmerIds[4], todayStr]
    );

    // Queue entries
    await client.query(`
      INSERT INTO queues (farmer_id, centre_id, slot_id, token_number, queue_number, status, estimated_wait_time, vehicle_number)
      VALUES
        (${farmerIds[0]}, 1, ${slot1.rows[0].id}, 'A102', 7, 'WAITING', 35, 'UP14-AB-1234'),
        (${farmerIds[1]}, 1, ${slot2.rows[0].id}, 'A103', 6, 'CALLED', 10, 'HR26-C-9812'),
        (${farmerIds[2]}, 1, ${slot3.rows[0].id}, 'A095', 1, 'IN_PROCUREMENT', 0, 'PB10-M-0091'),
        (${farmerIds[3]}, 1, ${slot4.rows[0].id}, 'A094', 0, 'COMPLETED', 0, 'UP14-X-9988'),
        (${farmerIds[4]}, 1, ${slot5.rows[0].id}, 'A093', 0, 'COMPLETED', 0, 'UP16-Z-1122')
    `);

    // Procurement Records
    const rec1 = await client.query(`
      INSERT INTO procurement_records (weighment_slip_no, farmer_id, centre_id, slot_id, crop, gross_weight, tare_weight, quantity, rate, total_amount, procurement_date, status)
      VALUES ('MW-9912', ${farmerIds[0]}, 1, ${slot1.rows[0].id}, 'Paddy (Rice) Grade A', 84.50, 24.50, 60.00, 2200.00, 132000.00, '${todayStr}', 'COMPLETED')
      RETURNING id
    `);

    const rec2 = await client.query(`
      INSERT INTO procurement_records (weighment_slip_no, farmer_id, centre_id, slot_id, crop, gross_weight, tare_weight, quantity, rate, total_amount, procurement_date, status)
      VALUES ('MW-9911', ${farmerIds[3]}, 1, ${slot4.rows[0].id}, 'Paddy (Rice) Grade A', 72.00, 22.00, 50.00, 2200.00, 110000.00, '${todayStr}', 'COMPLETED')
      RETURNING id
    `);

    console.log('=============================================');
    console.log('✓ PostgreSQL Database Seeded Successfully!');
    console.log('=============================================');
  });
};

// If run directly from terminal: node src/database/seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('✗ Seeding Failed:', err);
      process.exit(1);
    });
}

export default seedDatabase;
