import { query, withTransaction } from '../config/db.js';
import { generateWeighmentSlip, generatePaymentReference } from '../utils/tokenGenerator.js';

/**
 * 1. Get 7-Stage Procurement Journey for a Booking
 * GET /api/procurement/journey
 */
export const getProcurementJourney = async (req, res, next) => {
  try {
    const farmerId = req.user?.id || 1;
    const { bookingId } = req.query;

    let sql = `
      SELECT s.id as slot_id, s.booking_id, s.token_number, s.status as slot_status, s.slot_date, s.slot_time, s.crop, s.estimated_quantity,
             q.status as queue_status, q.weighbridge,
             p.id as record_id, p.weighment_slip_no, p.quantity as net_weight, p.quality_grade, p.moisture_content, p.rate, p.total_amount, p.status as procurement_status,
             pm.id as payment_id, pm.payment_status, pm.payment_reference, pm.amount as payment_amount,
             c.centre_name, c.district
      FROM procurement_slots s
      JOIN procurement_centres c ON s.centre_id = c.id
      LEFT JOIN queues q ON q.slot_id = s.id
      LEFT JOIN procurement_records p ON p.slot_id = s.id
      LEFT JOIN payments pm ON pm.procurement_id = p.id
      WHERE s.farmer_id = $1
    `;
    const params = [farmerId];
    if (bookingId) {
      sql += ` AND s.booking_id = $2`;
      params.push(bookingId);
    }
    sql += ` ORDER BY s.created_at DESC LIMIT 1`;

    const result = await query(sql, params);
    const data = result.rows[0];

    const currentStatus = data?.slot_status || 'WAITING';

    const stages = [
      {
        id: 1,
        title: 'Slot Booked',
        hiTitle: 'स्लॉट बुक हुआ',
        status: 'completed',
        timestamp: data ? `${data.slot_date} (${data.slot_time})` : '26 Aug 2026',
        desc: `Online procurement slot confirmed. Token ${data?.token_number || 'A102'} generated for ${data?.centre_name || 'APMC Muradnagar'}.`,
        officer: 'Online Portal Server',
      },
      {
        id: 2,
        title: 'Farmer Arrived',
        hiTitle: 'किसान का आगमन',
        status: ['ARRIVED', 'WAITING', 'CALLED', 'IN_PROCUREMENT', 'COMPLETED'].includes(currentStatus) ? 'completed' : 'upcoming',
        timestamp: 'Mandi Gate Entry',
        desc: 'Vehicle reported at Mandi Gate. Biometric and Aadhaar verified.',
        officer: 'Gate Inspector Desk',
      },
      {
        id: 3,
        title: 'Queue Waiting',
        hiTitle: 'कतार में प्रतीक्षारत',
        status: ['WAITING', 'CALLED', 'IN_PROCUREMENT', 'COMPLETED'].includes(currentStatus) ? 'completed' : 'upcoming',
        timestamp: 'Weighbridge Queue',
        desc: `Assigned to Electronic Weighbridge queue. Token ${data?.token_number || 'A102'}.`,
        officer: 'Queue Marshall Desk',
      },
      {
        id: 4,
        title: 'Procurement In Progress',
        hiTitle: 'तौल एवं गुणवत्ता जांच प्रगति पर',
        status: currentStatus === 'IN_PROCUREMENT' ? 'current' : (currentStatus === 'COMPLETED' ? 'completed' : 'upcoming'),
        timestamp: 'Sampling & Weighing',
        desc: data?.moisture_content
          ? `Moisture: ${data.moisture_content}% (${data.quality_grade || 'FAQ Grade A'}). Active weighment.`
          : 'Moisture testing and gross tractor weighment.',
        officer: 'Quality Grader & Weighing Officer',
      },
      {
        id: 5,
        title: 'Procurement Completed',
        hiTitle: 'खरीद पूर्ण (तौल पर्ची जारी)',
        status: currentStatus === 'COMPLETED' ? 'completed' : 'upcoming',
        timestamp: data?.weighment_slip_no ? `Slip #${data.weighment_slip_no}` : 'Pending Tare Weighment',
        desc: data?.weighment_slip_no
          ? `Net Weight: ${data.net_weight} Qtl. Official J-Form Weighment Slip generated.`
          : 'Tare weight calculation and digital weighment slip (J-Form) generation.',
        officer: 'Mandi In-Charge',
      },
      {
        id: 6,
        title: 'Payment Processing',
        hiTitle: 'भुगतान प्रक्रियाधीन (PFMS)',
        status: data?.payment_status ? (data.payment_status === 'PAID' ? 'completed' : 'current') : 'upcoming',
        timestamp: 'PFMS Validation',
        desc: 'Batch submitted to Public Financial Management System (PFMS) for bank DBT validation.',
        officer: 'State Civil Supplies Treasury',
      },
      {
        id: 7,
        title: 'Payment Completed',
        hiTitle: 'भुगतान संपन्न (बैंक खाते में DBT)',
        status: data?.payment_status === 'PAID' ? 'completed' : 'upcoming',
        timestamp: data?.payment_reference || 'Direct Benefit Transfer',
        desc: 'Total MSP amount credited directly to Aadhaar linked bank account.',
        officer: 'Reserve Bank / PFMS Direct',
      },
    ];

    res.status(200).json({
      success: true,
      currentStatus,
      stages,
      record: data || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Admin: Record Procurement Weighment & Quality Check
 * POST /api/admin/procurement/record
 */
export const recordProcurement = async (req, res, next) => {
  try {
    const {
      tokenNumber,
      farmerName,
      crop,
      grossWeight,
      tareWeight,
      netWeight,
      moistureContent,
      qualityGrade,
      rate,
      totalAmount,
    } = req.body;

    if (!tokenNumber || grossWeight === undefined || tareWeight === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token number, gross weight, and tare weight.',
      });
    }

    const calculatedNet = netWeight || Number((grossWeight - tareWeight).toFixed(2));
    const calculatedRate = rate || 2200;
    const calculatedTotal = totalAmount || Math.round(calculatedNet * calculatedRate);
    const weighmentSlipNo = generateWeighmentSlip();
    const paymentRef = generatePaymentReference();

    const recordResult = await withTransaction(async (client) => {
      // 1. Find the Slot & Farmer associated with tokenNumber
      const slotRes = await client.query(
        `SELECT s.id as slot_id, s.farmer_id, s.centre_id, s.crop, f.name, f.bank_name, f.bank_account, f.aadhaar_last4
         FROM procurement_slots s
         JOIN farmers f ON s.farmer_id = f.id
         WHERE s.token_number = $1
         ORDER BY s.created_at DESC LIMIT 1`,
        [tokenNumber]
      );

      let farmerId = 1;
      let centreId = 1;
      let slotId = null;
      let bankName = 'State Bank of India';
      let accountMasked = 'XXXXXX4920';

      if (slotRes.rows.length > 0) {
        farmerId = slotRes.rows[0].farmer_id;
        centreId = slotRes.rows[0].centre_id;
        slotId = slotRes.rows[0].slot_id;
        bankName = slotRes.rows[0].bank_name || 'State Bank of India';
        accountMasked = slotRes.rows[0].bank_account ? `XXXXXX${slotRes.rows[0].bank_account.slice(-4)}` : 'XXXXXX4920';
      }

      // 2. Insert into procurement_records
      const pInsert = await client.query(
        `INSERT INTO procurement_records (
          weighment_slip_no, farmer_id, centre_id, slot_id, crop,
          gross_weight, tare_weight, quantity, quality_grade,
          moisture_content, rate, total_amount, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'COMPLETED')
        RETURNING id, weighment_slip_no, crop, quantity, quality_grade, moisture_content, rate, total_amount, procurement_date, status`,
        [
          weighmentSlipNo,
          farmerId,
          centreId,
          slotId,
          crop || 'Paddy (Rice) Grade A',
          grossWeight,
          tareWeight,
          calculatedNet,
          qualityGrade || 'FAQ Grade A',
          moistureContent || 11.8,
          calculatedRate,
          calculatedTotal,
        ]
      );

      const newRecord = pInsert.rows[0];

      // 3. Update slot and queue status to COMPLETED
      if (slotId) {
        await client.query(`UPDATE procurement_slots SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [slotId]);
        await client.query(`UPDATE queues SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE slot_id = $1`, [slotId]);
      }

      // 4. Create corresponding DBT Payment Record
      await client.query(
        `INSERT INTO payments (
          farmer_id, procurement_id, amount, payment_status,
          payment_reference, bank_name, account_masked
        ) VALUES ($1, $2, $3, 'PAYMENT_PROCESSING', $4, $5, $6)`,
        [
          farmerId,
          newRecord.id,
          calculatedTotal,
          paymentRef,
          bankName,
          accountMasked,
        ]
      );

      // 5. Create Notification for Farmer
      await client.query(
        `INSERT INTO notifications (farmer_id, type, message) VALUES ($1, $2, $3)`,
        [
          farmerId,
          'WEIGHMENT_COMPLETED',
          `Procurement weighment completed! Slip #${weighmentSlipNo}. Net Weight: ${calculatedNet} Qtl. Total MSP: ₹${calculatedTotal.toLocaleString('en-IN')}. DBT payment initiated.`,
        ]
      );

      return {
        ...newRecord,
        farmerName: farmerName || 'Farmer',
        weighmentSlipNo,
        paymentReference: paymentRef,
      };
    });

    res.status(201).json({
      success: true,
      message: 'Procurement weighment recorded and J-Form slip generated successfully',
      procurement: recordResult,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Admin: Get all recorded procurements
 * GET /api/admin/procurement/records
 */
export const getProcurementRecords = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.id, p.weighment_slip_no, p.crop, p.gross_weight, p.tare_weight,
              p.quantity as net_weight, p.quality_grade, p.moisture_content, p.rate,
              p.total_amount, p.procurement_date, p.status,
              f.name as farmer_name, f.mobile_number, c.centre_name
       FROM procurement_records p
       JOIN farmers f ON p.farmer_id = f.id
       JOIN procurement_centres c ON p.centre_id = c.id
       ORDER BY p.procurement_date DESC, p.created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      records: result.rows,
    });
  } catch (err) {
    next(err);
  }
};
