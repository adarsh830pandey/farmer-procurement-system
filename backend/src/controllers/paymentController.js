import { query, withTransaction } from '../config/db.js';
import { generatePaymentReference } from '../utils/tokenGenerator.js';

/**
 * 1. Process Mock Payment for Order
 * POST /api/payments
 */
export const processPayment = async (req, res, next) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and payment amount are required.',
      });
    }

    const transactionId = generatePaymentReference();

    const paymentResult = await withTransaction(async (client) => {
      // 1. Fetch order details
      const oRes = await client.query(
        `SELECT o.*, f.user_id as farmer_user_id, f.bank_name, f.bank_account_number
         FROM procurement_orders o
         JOIN farmers f ON o.farmer_id = f.id
         WHERE o.id = $1`,
        [orderId]
      );

      if (oRes.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = oRes.rows[0];

      // 2. Insert into payments table
      const pRes = await client.query(
        `INSERT INTO payments (
          order_id, farmer_id, amount, payment_method, transaction_id, payment_status,
          bank_name, account_masked
        ) VALUES ($1, $2, $3, $4, $5, 'successful', $6, $7)
        RETURNING id, order_id, amount, payment_method, transaction_id, payment_status, payment_date`,
        [
          order.id,
          order.farmer_id,
          Number(amount),
          paymentMethod || 'Direct Benefit Transfer (DBT)',
          transactionId,
          order.bank_name || 'State Bank of India',
          order.bank_account_number ? `XXXXXX${order.bank_account_number.slice(-4)}` : 'XXXXXX4920',
        ]
      );

      // 3. Mark order as completed
      await client.query(
        `UPDATE procurement_orders
         SET order_status = 'completed', completed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );

      // 4. Send notification to farmer
      await client.query(
        `INSERT INTO notifications (user_id, title, message, notification_type)
         VALUES ($1, 'Payment Received', $2, 'PAYMENT_CREDITED')`,
        [
          order.farmer_user_id,
          `Payment of ₹${Number(amount).toLocaleString('en-IN')} for Order #${orderId} has been successfully processed. Ref: ${transactionId}.`,
        ]
      );

      return pRes.rows[0];
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully (SIH Mock Gateway)',
      data: paymentResult,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get Payment by ID
 * GET /api/payments/:id
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT pm.id, pm.order_id, pm.amount, pm.payment_method, pm.transaction_id,
              pm.payment_status, pm.payment_date, pm.bank_name, pm.account_masked,
              f.farmer_id as farmer_code, u.name as farmer_name, u.phone as farmer_phone
       FROM payments pm
       JOIN farmers f ON pm.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE pm.id::text = $1 OR pm.transaction_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Get Payment for Order
 * GET /api/orders/:id/payment
 */
export const getPaymentByOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT pm.*, u.name as farmer_name, u.phone as farmer_phone
       FROM payments pm
       JOIN farmers f ON pm.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE pm.order_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No payment found for this order' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Get Logged-in Farmer's Payments
 * GET /api/payments/my-payments
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const farmerId = req.user?.farmerId || req.user?.id || 1;

    const result = await query(
      `SELECT pm.id, pm.amount, pm.payment_status as "paymentStatus", pm.transaction_id as "transactionId",
              pm.payment_date as "paymentDate", pm.bank_name as "bankName", pm.account_masked as "accountMasked",
              pr.weighment_slip_no as "weighmentSlipNo", pr.crop, pr.quantity, pr.rate, pr.total_amount as "totalAmount",
              pr.procurement_date as "procurementDate",
              u.name as "farmerName", u.phone as "farmerMobile",
              c.centre_name as "centreName"
       FROM payments pm
       LEFT JOIN procurement_records pr ON pm.procurement_id = pr.id
       JOIN farmers f ON pm.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       LEFT JOIN procurement_centres c ON pr.centre_id = c.id
       WHERE pm.farmer_id = $1 OR f.user_id = $1
       ORDER BY pm.payment_date DESC, pm.created_at DESC`,
      [farmerId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      payments: result.rows, // backward compatibility
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Get Payment Receipt
 * GET /api/payments/receipt/:id
 */
export const getPaymentReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT pm.id, pm.amount, pm.payment_status as "paymentStatus", pm.transaction_id as "transactionId",
              pm.payment_date as "paymentDate", pm.bank_name as "bankName", pm.account_masked as "accountMasked",
              pr.weighment_slip_no as "weighmentSlipNo", pr.crop, pr.quantity, pr.rate, pr.total_amount as "totalAmount",
              pr.procurement_date as "procurementDate", pr.quality_grade as "qualityGrade", pr.moisture_content as "moistureContent",
              u.name as "farmerName", u.phone as "farmerMobile", u.village, u.district,
              c.centre_name as "centreName"
       FROM payments pm
       LEFT JOIN procurement_records pr ON pm.procurement_id = pr.id
       JOIN farmers f ON pm.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       LEFT JOIN procurement_centres c ON pr.centre_id = c.id
       WHERE pm.id::text = $1 OR pm.transaction_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      receipt: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Admin: Get All Payments
 * GET /api/admin/payments
 */
export const getAllPayments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT pm.id, pm.amount, pm.payment_status as status, pm.transaction_id as "transactionId",
              pm.payment_date as date, pm.bank_name, pm.account_masked as "accountNumber",
              pr.weighment_slip_no as "slipNo", pr.crop, pr.quantity, pr.rate,
              u.name as farmer, u.phone as mobile
       FROM payments pm
       LEFT JOIN procurement_records pr ON pm.procurement_id = pr.id
       JOIN farmers f ON pm.farmer_id = f.id
       JOIN users u ON f.user_id = u.id
       ORDER BY pm.payment_date DESC, pm.created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      payments: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Admin: Update Payment Status
 * PUT /api/admin/payments/:id
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const result = await query(
      `UPDATE payments
       SET payment_status = COALESCE($1, payment_status),
           transaction_id = COALESCE($2, transaction_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $3 OR transaction_id = $3
       RETURNING *`,
      [status, transactionId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
