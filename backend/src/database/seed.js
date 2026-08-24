import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { pool, withTransaction } from '../config/db.js';
import runMigrations from './migrate.js';

export const seedDatabase = async () => {
  console.log('=============================================');
  console.log('Seeding PostgreSQL Database with Demo Data...');
  console.log('=============================================');

  // 1. Ensure migrations are up to date
  await runMigrations();

  const defaultPassword = 'farmer123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, salt);

  await withTransaction(async (client) => {
    // 2. Clear existing records for clean seeding
    await client.query(`
      TRUNCATE TABLE notifications, payments, procurement_records, queues, procurement_slots, farmers, procurement_centres, admins RESTART IDENTITY CASCADE
    `);

    // 3. Seed Admins
    console.log('Seeding Procurement Centre Admins...');
    await client.query(
      `INSERT INTO admins (username, email, password_hash, role, centre_code, name)
       VALUES ($1, $2, $3, 'admin', 'MANDI-GZB-01', 'Mandi In-Charge Officer')`,
      ['admin', 'admin@kisan.gov.in', adminHash]
    );

    // 4. Seed 4 Procurement Centres
    console.log('Seeding 4 Procurement Centres...');
    const centreRes = await client.query(`
      INSERT INTO procurement_centres (centre_name, centre_code, location, district, state, capacity)
      VALUES
        ('APMC Mandi Yard, Muradnagar', 'MANDI-GZB-01', 'NH-58, Muradnagar, Ghaziabad', 'Ghaziabad', 'Uttar Pradesh', 160),
        ('Sahibabad Principal Mandi Complex', 'MANDI-GZB-02', 'Site-4 Industrial Area, Sahibabad', 'Ghaziabad', 'Uttar Pradesh', 200),
        ('Modinagar Cooperative Centre (PACS)', 'PACS-GZB-03', 'Tehsil Road, Modinagar', 'Ghaziabad', 'Uttar Pradesh', 120),
        ('Loni Krishi Upaj Mandi Centre', 'PACS-GZB-04', 'Pusta Road, Loni', 'Ghaziabad', 'Uttar Pradesh', 140)
      RETURNING id, centre_name, centre_code
    `);
    const centres = centreRes.rows;

    // 5. Seed 10 Realistic Indian Farmers
    console.log('Seeding 10 Farmers...');
    const farmersData = [
      ['KP-2026-8821', 'Ramesh Singh', '9876543210', '8821', 'Near Primary School', 'Muradnagar Dehat', 'Ghaziabad', 'Uttar Pradesh', 2.5, 'Paddy (Rice)', 60, 'XXXXXX4920', 'SBIN0001234'],
      ['KP-2026-8822', 'Baldev Yadav', '9812345670', '5670', 'Main Chauraha', 'Rawli Kalan', 'Ghaziabad', 'Uttar Pradesh', 3.0, 'Paddy (Rice)', 45, 'XXXXXX3301', 'PUNB0123456'],
      ['KP-2026-8823', 'Sukhwinder Gill', '9789012345', '2345', 'Kisan Basti', 'Surana', 'Ghaziabad', 'Uttar Pradesh', 5.2, 'Paddy (Rice)', 80, 'XXXXXX8812', 'HDFC0000987'],
      ['KP-2026-8824', 'Harish Chandra', '9654321098', '1098', 'Post Office Road', 'Niwari', 'Ghaziabad', 'Uttar Pradesh', 1.8, 'Paddy (Rice)', 50, 'XXXXXX1190', 'BARB0MURADN'],
      ['KP-2026-8825', 'Manoj Kumar', '9543210987', '0987', 'Near Canal Bridge', 'Bhojpur', 'Ghaziabad', 'Uttar Pradesh', 4.0, 'Paddy (Rice)', 70, 'XXXXXX7721', 'CNRB0002345'],
      ['KP-2026-8826', 'Pritam Lal', '9711223344', '3344', 'Gram Panchayat Ghar', 'Patla', 'Ghaziabad', 'Uttar Pradesh', 2.2, 'Paddy (Rice)', 50, 'XXXXXX5541', 'SBIN0004321'],
      ['KP-2026-8827', 'Devendra Sharma', '9822334455', '4455', 'Bypass Road', 'Dasna', 'Ghaziabad', 'Uttar Pradesh', 3.5, 'Paddy (Rice)', 65, 'XXXXXX6612', 'ICIC0001122'],
      ['KP-2026-8828', 'Kuldeep Tyagi', '9933445566', '5566', 'Morta Farm House', 'Morta', 'Ghaziabad', 'Uttar Pradesh', 6.0, 'Paddy (Rice)', 100, 'XXXXXX9901', 'SBIN0008899'],
      ['KP-2026-8829', 'Santosh Devi', '9844556677', '6677', 'Station Road', 'Duhai', 'Ghaziabad', 'Uttar Pradesh', 1.5, 'Paddy (Rice)', 35, 'XXXXXX2234', 'UBIN0532101'],
      ['KP-2026-8830', 'Vijay Pal', '9755667788', '7788', 'Village Chaupal', 'Abupur', 'Ghaziabad', 'Uttar Pradesh', 4.5, 'Paddy (Rice)', 75, 'XXXXXX4419', 'PUNB0987654'],
    ];

    const farmerIds = [];
    for (const f of farmersData) {
      const res = await client.query(
        `INSERT INTO farmers (
          farmer_code, name, mobile_number, aadhaar_last4, password_hash,
          address, village, district, state, land_acres, primary_crop,
          estimated_quantity, bank_account, ifsc_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [f[0], f[1], f[2], f[3], passwordHash, f[4], f[5], f[6], f[7], f[8], f[9], f[10], f[11], f[12]]
      );
      farmerIds.push(res.rows[0].id);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 6. Seed Procurement Slots & Queues
    console.log('Seeding Slots & Queue records...');
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

    // Queue inserts
    await client.query(`
      INSERT INTO queues (farmer_id, centre_id, slot_id, token_number, queue_number, status, estimated_wait_time, vehicle_number)
      VALUES
        (${farmerIds[0]}, 1, ${slot1.rows[0].id}, 'A102', 7, 'WAITING', 35, 'UP14-AB-1234'),
        (${farmerIds[1]}, 1, ${slot2.rows[0].id}, 'A103', 6, 'CALLED', 10, 'HR26-C-9812'),
        (${farmerIds[2]}, 1, ${slot3.rows[0].id}, 'A095', 1, 'IN_PROCUREMENT', 0, 'PB10-M-0091'),
        (${farmerIds[3]}, 1, ${slot4.rows[0].id}, 'A094', 0, 'COMPLETED', 0, 'UP14-X-9988'),
        (${farmerIds[4]}, 1, ${slot5.rows[0].id}, 'A093', 0, 'COMPLETED', 0, 'UP16-Z-1122')
    `);

    // 7. Seed Procurement Weighment Records & Payments
    console.log('Seeding Procurement Weighment Records & Payments...');
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

    const rec3 = await client.query(`
      INSERT INTO procurement_records (weighment_slip_no, farmer_id, centre_id, slot_id, crop, gross_weight, tare_weight, quantity, rate, total_amount, procurement_date, status)
      VALUES ('MW-9910', ${farmerIds[4]}, 1, ${slot5.rows[0].id}, 'Paddy (Rice) Grade A', 95.00, 25.00, 70.00, 2200.00, 154000.00, '${todayStr}', 'COMPLETED')
      RETURNING id
    `);

    // Payments
    await client.query(`
      INSERT INTO payments (farmer_id, procurement_id, amount, payment_status, payment_reference, payment_date, bank_name, account_masked)
      VALUES
        (${farmerIds[0]}, ${rec1.rows[0].id}, 132000.00, 'PAYMENT_PROCESSING', 'PFMS-DBT-20260828-98214', '${todayStr}', 'State Bank of India', 'XXXXXX4920'),
        (${farmerIds[3]}, ${rec2.rows[0].id}, 110000.00, 'PAID', 'PFMS-DBT-20260828-98215', '${todayStr}', 'Bank of Baroda', 'XXXXXX1190'),
        (${farmerIds[4]}, ${rec3.rows[0].id}, 154000.00, 'PAID', 'PFMS-DBT-20260828-98216', '${todayStr}', 'Canara Bank', 'XXXXXX7721')
    `);

    // 8. Seed Notifications
    console.log('Seeding Notifications...');
    await client.query(`
      INSERT INTO notifications (farmer_id, type, message)
      VALUES
        (${farmerIds[0]}, 'SLOT_BOOKED', 'Your procurement slot for Paddy is booked on ${todayStr} (10:00 AM – 11:00 AM). Token: A102.'),
        (${farmerIds[0]}, 'QUEUE_ALERT', 'Token A095 is currently on Electronic Weighbridge #2. You have 6 farmers ahead.'),
        (${farmerIds[1]}, 'QUEUE_ALERT', 'Your Token A103 has been CALLED to Electronic Weighbridge #2.'),
        (${farmerIds[3]}, 'PAYMENT_CREDITED', 'DBT Payment of ₹1,10,000 has been transferred to your bank account. Ref: PFMS-DBT-20260828-98215.')
    `);

    console.log('✓ Database Seeding completed successfully!');
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
