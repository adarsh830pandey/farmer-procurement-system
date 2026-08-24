import { query, withTransaction } from '../config/db.js';

/**
 * 1. Get Live Queue Status for Logged-in Farmer
 * GET /api/queue/my-status
 */
export const getMyQueueStatus = async (req, res, next) => {
  try {
    const farmerId = req.user?.id || 1;
    const { bookingId } = req.query;

    let slotQuery = `
      SELECT q.id as queue_id, q.token_number as "tokenNumber", q.queue_number as "queuePosition",
             q.status, q.estimated_wait_time as "estimatedWaitMinutes", q.weighbridge, q.vehicle_number as "vehicleNumber",
             s.id as slot_id, s.booking_id as "bookingId", s.slot_date as "date", s.slot_time as "slotTime", s.crop,
             c.id as centre_id, c.centre_name as "centreName", c.district
      FROM queues q
      JOIN procurement_slots s ON q.slot_id = s.id
      JOIN procurement_centres c ON q.centre_id = c.id
      WHERE q.farmer_id = $1
    `;
    const params = [farmerId];

    if (bookingId) {
      slotQuery += ` AND s.booking_id = $2`;
      params.push(bookingId);
    }
    slotQuery += ` ORDER BY q.created_at DESC LIMIT 1`;

    const myQueueRes = await query(slotQuery, params);

    if (myQueueRes.rows.length === 0) {
      return res.status(200).json({
        success: true,
        queue: {
          tokenNumber: 'A102',
          currentServingToken: 'A095',
          farmersAhead: 6,
          estimatedWaitMinutes: 35,
          status: 'WAITING',
          centreName: 'APMC Mandi Yard, Muradnagar',
          gateNumber: 'Gate 2A',
          slotTime: '10:00 AM – 11:00 AM',
          date: new Date().toISOString().split('T')[0],
          crop: 'Paddy / धान (Grade A)',
        },
      });
    }

    const myQueue = myQueueRes.rows[0];

    // Find the currently serving token at this centre (status: IN_PROCUREMENT or latest CALLED)
    const servingRes = await query(
      `SELECT token_number FROM queues
       WHERE centre_id = $1 AND status IN ('IN_PROCUREMENT', 'CALLED')
       ORDER BY updated_at DESC LIMIT 1`,
      [myQueue.centre_id]
    );
    const currentServingToken = servingRes.rows.length > 0 ? servingRes.rows[0].token_number : 'A095';

    // Calculate farmers ahead: count of queues with lower queue_number that are still WAITING or CALLED
    const aheadRes = await query(
      `SELECT COUNT(*)::int as ahead_count FROM queues
       WHERE centre_id = $1 AND queue_number < $2 AND status IN ('WAITING', 'CALLED')`,
      [myQueue.centre_id, myQueue.queuePosition]
    );
    const farmersAhead = aheadRes.rows[0].ahead_count || 0;

    res.status(200).json({
      success: true,
      queue: {
        tokenNumber: myQueue.tokenNumber,
        currentServingToken,
        farmersAhead,
        estimatedWaitMinutes: Math.max(5, farmersAhead * 6),
        status: myQueue.status,
        centreName: myQueue.centreName,
        gateNumber: 'Gate 2A',
        slotTime: myQueue.slotTime,
        date: myQueue.date,
        crop: myQueue.crop,
        weighbridge: myQueue.weighbridge,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get Centre Live Queue Display
 * GET /api/queue/live
 */
export const getCentreQueue = async (req, res, next) => {
  try {
    const { centreId } = req.query;
    let resolvedCentreId = 1;

    if (centreId) {
      const cRes = await query(`SELECT id FROM procurement_centres WHERE centre_code = $1 OR id::text = $1`, [centreId]);
      if (cRes.rows.length > 0) resolvedCentreId = cRes.rows[0].id;
    }

    const servingRes = await query(
      `SELECT q.token_number, q.status, q.weighbridge, s.crop
       FROM queues q
       JOIN procurement_slots s ON q.slot_id = s.id
       WHERE q.centre_id = $1 AND q.status = 'IN_PROCUREMENT'
       ORDER BY q.updated_at DESC LIMIT 1`,
      [resolvedCentreId]
    );

    const waitingRes = await query(
      `SELECT q.token_number, q.queue_number, q.status, s.slot_time
       FROM queues q
       JOIN procurement_slots s ON q.slot_id = s.id
       WHERE q.centre_id = $1 AND q.status IN ('WAITING', 'CALLED')
       ORDER BY q.queue_number ASC LIMIT 10`,
      [resolvedCentreId]
    );

    res.status(200).json({
      success: true,
      currentServing: servingRes.rows.length > 0 ? servingRes.rows[0].token_number : 'A095',
      waitingList: waitingRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Admin: Get Today's Full Queue for Procurement Centre
 * GET /api/admin/queue
 */
export const getAdminQueue = async (req, res, next) => {
  try {
    const { centreId } = req.query;

    const result = await query(
      `SELECT q.id as queue_id, q.token_number as token, f.name as farmer, f.mobile_number as mobile,
              s.slot_time as slot, s.estimated_quantity as quantity, s.crop,
              q.status, q.vehicle_number as vehicle, q.weighbridge
       FROM queues q
       JOIN farmers f ON q.farmer_id = f.id
       JOIN procurement_slots s ON q.slot_id = s.id
       ORDER BY q.queue_number ASC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      queue: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Admin: Update Status of a Token
 * PUT /api/admin/queue/:tokenId/status
 */
export const updateTokenStatus = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status update.' });
    }

    const updated = await withTransaction(async (client) => {
      // 1. Update queue table
      const qRes = await client.query(
        `UPDATE queues
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE token_number = $2 OR id::text = $2
         RETURNING id, farmer_id, slot_id, token_number, status`,
        [status, tokenId]
      );

      if (qRes.rows.length === 0) {
        throw new Error(`Token ${tokenId} not found in active queue.`);
      }

      const queueRecord = qRes.rows[0];

      // 2. Update corresponding procurement_slots status
      await client.query(
        `UPDATE procurement_slots
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [status, queueRecord.slot_id]
      );

      // 3. Insert Notification for Farmer
      let msg = `Queue Update: Your token ${queueRecord.token_number} status is now ${status}.`;
      if (status === 'CALLED') {
        msg = `ATTENTION: Token ${queueRecord.token_number} has been CALLED to Electronic Weighbridge #2. Please proceed immediately.`;
      } else if (status === 'IN_PROCUREMENT') {
        msg = `Moisture testing & Weighment active for token ${queueRecord.token_number}.`;
      } else if (status === 'COMPLETED') {
        msg = `Weighment completed for token ${queueRecord.token_number}. Your J-Form receipt is ready.`;
      }

      await client.query(
        `INSERT INTO notifications (farmer_id, type, message) VALUES ($1, $2, $3)`,
        [queueRecord.farmer_id, 'QUEUE_STATUS_CHANGE', msg]
      );

      return queueRecord;
    });

    res.status(200).json({
      success: true,
      message: `Token status updated to ${status}`,
      token: updated,
    });
  } catch (err) {
    next(err);
  }
};
