import { query } from '../config/db.js';

/**
 * 1. Get Logged-in Farmer's Payments & Receipts
 * GET /api/payments/my-payments
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const farmerId = req.user?.id || 1;

    const result = await query(
      `SELECT pm.id, pm.amount, pm.payment_status as "paymentStatus", pm.payment_reference as "transactionId",
              pm.payment_date as "paymentDate", pm.bank_name as "bankName", pm.account_masked as "accountMasked",
              pr.weighment_slip_no as "weighmentSlipNo", pr.crop, pr.quantity, pr.rate, pr.total_amount as "totalAmount",
              pr.procurement_date as "procurementDate",
              f.name as "farmerName", f.mobile_number as "farmerMobile", f.aadhaar_last4 as "aadhaarLast4",
              c.centre_name as "centreName"
       FROM payments pm
       JOIN procurement_records pr ON pm.procurement_id = pr.id
       JOIN farmers f ON pm.farmer_id = f.id
       JOIN procurement_centres c ON pr.centre_id = c.id
       WHERE pm.farmer_id = $1
       ORDER BY pm.payment_date DESC, pm.created_at DESC`,
      [farmerId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      payments: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get Specific Payment Receipt by ID
 * GET /api/payments/receipt/:id
 */
export const getPaymentReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT pm.id, pm.amount, pm.payment_status as "paymentStatus", pm.payment_reference as "transactionId",
              pm.payment_date as "paymentDate", pm.bank_name as "bankName", pm.account_masked as "accountMasked",
              pr.weighment_slip_no as "weighmentSlipNo", pr.crop, pr.quantity, pr.rate, pr.total_amount as "totalAmount",
              pr.procurement_date as "procurementDate", pr.quality_grade as "qualityGrade", pr.moisture_content as "moistureContent",
              f.name as "farmerName", f.mobile_number as "farmerMobile", f.aadhaar_last4 as "aadhaarLast4", f.village, f.district,
              c.centre_name as "centreName"
       FROM payments pm
       JOIN procurement_records pr ON pm.procurement_id = pr.id
       JOIN farmers f ON pm.farmer_id = f.id
       JOIN procurement_centres c ON pr.centre_id = c.id
       WHERE pm.id::text = $1 OR pm.payment_reference = $1 OR pr.weighment_slip_no = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.status(200).json({
      success: true,
      receipt: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Admin: Get All Payments
 * GET /api/admin/payments
 */
export const getAllPayments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT pm.id, pm.amount, pm.payment_status as status, pm.payment_reference as "transactionId",
              pm.payment_date as date, pm.bank_name, pm.account_masked as "accountNumber",
              pr.weighment_slip_no as "slipNo", pr.crop, pr.quantity, pr.rate,
              f.name as farmer, f.mobile_number as mobile
       FROM payments pm
       JOIN procurement_records pr ON pm.procurement_id = pr.id
       JOIN farmers f ON pm.farmer_id = f.id
       ORDER BY pm.payment_date DESC, pm.created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      payments: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Admin: Update Payment Status & Transaction ID
 * PUT /api/admin/payments/:id
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, transactionId, paymentDate } = req.body;

    const updateSql = `
      UPDATE payments
      SET payment_status = COALESCE($1, payment_status),
          payment_reference = COALESCE($2, payment_reference),
          payment_date = COALESCE($3, payment_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id::text = $4 OR payment_reference = $4
      RETURNING id, farmer_id, amount, payment_status, payment_reference, payment_date
    `;

    const result = await query(updateSql, [
      status,
      transactionId,
      paymentDate ? new Date(paymentDate) : null,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const updatedPayment = result.rows[0];

    // If marked as PAID, notify the farmer
    if (status === 'PAID') {
      await query(
        `INSERT INTO notifications (farmer_id, type, message) VALUES ($1, $2, $3)`,
        [
          updatedPayment.farmer_id,
          'PAYMENT_CREDITED',
          `DBT Payment of ₹${Number(updatedPayment.amount).toLocaleString('en-IN')} has been transferred to your bank account. PFMS Ref: ${updatedPayment.payment_reference}.`,
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment: updatedPayment,
    });
  } catch (err) {
    next(err);
  }
};
