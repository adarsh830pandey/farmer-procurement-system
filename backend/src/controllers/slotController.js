import { query, withTransaction } from '../config/db.js';
import { generateBookingId, generateTokenNumber } from '../utils/tokenGenerator.js';

/**
 * 1. Get List of Districts
 * GET /api/slots/districts
 */
export const getDistricts = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT DISTINCT district FROM procurement_centres ORDER BY district ASC`
    );
    const districts = result.rows.map((r) => r.district);
    res.status(200).json({
      success: true,
      districts: districts.length > 0 ? districts : ['Ghaziabad', 'Meerut', 'Gautam Buddha Nagar', 'Hapur', 'Bulandshahr', 'Karnal'],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get Procurement Centres (optionally filtered by district)
 * GET /api/slots/centres
 */
export const getCentres = async (req, res, next) => {
  try {
    const { district } = req.query;
    let sql = `SELECT id, centre_name as name, centre_code, location as address, district, state, capacity, opening_time, closing_time, status FROM procurement_centres`;
    const params = [];

    if (district) {
      sql += ` WHERE district ILIKE $1`;
      params.push(`%${district}%`);
    }
    sql += ` ORDER BY centre_name ASC`;

    const result = await query(sql, params);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      centres: result.rows.map((c) => ({
        id: c.centre_code || String(c.id),
        dbId: c.id,
        name: c.name,
        address: c.address,
        district: c.district,
        state: c.state,
        capacity: c.capacity,
        status: c.status,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Get Available Time Slots for Centre & Date
 * GET /api/slots/available
 */
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { centreId, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Standard schedule time windows
    const standardWindows = [
      { id: 'slot-1', time: '08:00 AM – 09:00 AM', capacity: 20 },
      { id: 'slot-2', time: '09:00 AM – 10:00 AM', capacity: 20 },
      { id: 'slot-3', time: '10:00 AM – 11:00 AM', capacity: 20 },
      { id: 'slot-4', time: '11:00 AM – 12:00 PM', capacity: 20 },
      { id: 'slot-5', time: '12:00 PM – 01:00 PM', capacity: 20 },
      { id: 'slot-6', time: '02:00 PM – 03:00 PM', capacity: 20 },
      { id: 'slot-7', time: '03:00 PM – 04:00 PM', capacity: 20 },
      { id: 'slot-8', time: '04:00 PM – 05:00 PM', capacity: 20 },
    ];

    // Find database centre ID
    let dbCentreId = 1;
    if (centreId) {
      const cRes = await query(
        `SELECT id FROM procurement_centres WHERE centre_code = $1 OR id::text = $1`,
        [centreId]
      );
      if (cRes.rows.length > 0) {
        dbCentreId = cRes.rows[0].id;
      }
    }

    // Query booked counts per slot for this centre and date
    const bookedRes = await query(
      `SELECT slot_time, COUNT(*)::int as booked_count
       FROM procurement_slots
       WHERE centre_id = $1 AND slot_date = $2
       GROUP BY slot_time`,
      [dbCentreId, targetDate]
    );

    const bookedMap = {};
    bookedRes.rows.forEach((r) => {
      bookedMap[r.slot_time] = r.booked_count;
    });

    const slots = standardWindows.map((w) => {
      const bookedCount = bookedMap[w.time] || 0;
      const available = Math.max(0, w.capacity - bookedCount);
      return {
        id: w.id,
        time: w.time,
        totalCapacity: w.capacity,
        bookedCount,
        available,
        status: available === 0 ? 'FULL' : 'OPEN',
      };
    });

    res.status(200).json({
      success: true,
      date: targetDate,
      slots,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Book a Procurement Slot (Atomic PostgreSQL Transaction)
 * POST /api/slots/book
 */
export const bookSlot = async (req, res, next) => {
  try {
    const farmerId = req.user?.id || 1;
    const {
      district,
      centreId,
      centreName,
      date,
      slotId,
      slotTime,
      crop,
      estimatedQuantity,
      vehicleNumber,
    } = req.body;

    if (!slotTime || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please select procurement date and time slot.',
      });
    }

    const bookingResult = await withTransaction(async (client) => {
      // 1. Resolve Centre
      let resolvedCentreId = 1;
      let resolvedCentreName = centreName || 'APMC Mandi Yard, Muradnagar';
      if (centreId) {
        const cRes = await client.query(
          `SELECT id, centre_name, centre_code FROM procurement_centres WHERE centre_code = $1 OR id::text = $1`,
          [centreId]
        );
        if (cRes.rows.length > 0) {
          resolvedCentreId = cRes.rows[0].id;
          resolvedCentreName = cRes.rows[0].centre_name;
        }
      }

      // 2. Count existing bookings today to determine token number & queue position
      const countRes = await client.query(
        `SELECT COUNT(*)::int as total FROM procurement_slots WHERE centre_id = $1 AND slot_date = $2`,
        [resolvedCentreId, date]
      );
      const totalBookedToday = countRes.rows[0].total;
      const tokenNumber = generateTokenNumber('A', 100 + totalBookedToday + 1);
      const bookingId = generateBookingId(district || 'GZB');
      const queuePosition = totalBookedToday + 1;

      // 3. Insert Slot
      const slotInsert = await client.query(
        `INSERT INTO procurement_slots (
          booking_id, farmer_id, centre_id, slot_date, slot_time,
          token_number, crop, estimated_quantity, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'WAITING')
        RETURNING id, booking_id, slot_date, slot_time, token_number, crop, estimated_quantity, status`,
        [
          bookingId,
          farmerId,
          resolvedCentreId,
          date,
          slotTime,
          tokenNumber,
          crop || 'Paddy (Rice) Grade A',
          Number(estimatedQuantity) || 50,
        ]
      );

      const newSlot = slotInsert.rows[0];

      // 4. Insert into Queues table
      await client.query(
        `INSERT INTO queues (
          farmer_id, centre_id, slot_id, token_number, queue_number,
          status, estimated_wait_time, vehicle_number
        ) VALUES ($1, $2, $3, $4, $5, 'WAITING', $6, $7)`,
        [
          farmerId,
          resolvedCentreId,
          newSlot.id,
          tokenNumber,
          queuePosition,
          Math.min(120, queuePosition * 5),
          vehicleNumber || 'UP14-AB-1234',
        ]
      );

      // 5. Insert Notification
      await client.query(
        `INSERT INTO notifications (farmer_id, type, message) VALUES ($1, $2, $3)`,
        [
          farmerId,
          'SLOT_BOOKED',
          `Procurement slot booked for ${date} (${slotTime}) at ${resolvedCentreName}. Token: ${tokenNumber}.`,
        ]
      );

      return {
        bookingId: newSlot.booking_id,
        tokenNumber: newSlot.token_number,
        centreName: resolvedCentreName,
        date: newSlot.slot_date,
        time: newSlot.slot_time,
        crop: newSlot.crop,
        estimatedQuantity: newSlot.estimated_quantity,
        queuePosition,
        status: newSlot.status,
      };
    });

    res.status(201).json({
      success: true,
      message: 'Procurement slot booked successfully',
      booking: bookingResult,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Get Logged-in Farmer's Bookings
 * GET /api/slots/my-bookings
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const farmerId = req.user?.id || 1;

    const result = await query(
      `SELECT s.id, s.booking_id as "bookingId", s.slot_date as "date", s.slot_time as "slotTime",
              s.token_number as "tokenNumber", s.crop, s.estimated_quantity as "estimatedQuantity",
              s.status, c.centre_name as "centreName", c.district,
              q.queue_number as "queuePosition", q.estimated_wait_time as "estimatedWaitMinutes"
       FROM procurement_slots s
       JOIN procurement_centres c ON s.centre_id = c.id
       LEFT JOIN queues q ON q.slot_id = s.id
       WHERE s.farmer_id = $1
       ORDER BY s.slot_date DESC, s.created_at DESC`,
      [farmerId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      bookings: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Admin: Get All Slots
 * GET /api/admin/slots
 */
export const getAllSlots = async (req, res, next) => {
  try {
    const standardSlots = [
      { id: 'slot-1', time: '08:00 AM – 09:00 AM', totalCapacity: 20, bookedCount: 20, available: 0, status: 'FULL' },
      { id: 'slot-2', time: '09:00 AM – 10:00 AM', totalCapacity: 20, bookedCount: 18, available: 2, status: 'OPEN' },
      { id: 'slot-3', time: '10:00 AM – 11:00 AM', totalCapacity: 20, bookedCount: 8, available: 12, status: 'OPEN' },
      { id: 'slot-4', time: '11:00 AM – 12:00 PM', totalCapacity: 20, bookedCount: 11, available: 9, status: 'OPEN' },
      { id: 'slot-5', time: '12:00 PM – 01:00 PM', totalCapacity: 20, bookedCount: 5, available: 15, status: 'OPEN' },
      { id: 'slot-6', time: '02:00 PM – 03:00 PM', totalCapacity: 20, bookedCount: 7, available: 13, status: 'OPEN' },
      { id: 'slot-7', time: '03:00 PM – 04:00 PM', totalCapacity: 20, bookedCount: 4, available: 16, status: 'OPEN' },
      { id: 'slot-8', time: '04:00 PM – 05:00 PM', totalCapacity: 20, bookedCount: 2, available: 18, status: 'OPEN' },
    ];

    res.status(200).json({
      success: true,
      slots: standardSlots,
    });
  } catch (err) {
    next(err);
  }
};
