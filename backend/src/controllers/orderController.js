import { query, withTransaction } from '../config/db.js';

/**
 * 1. Place Procurement Order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const buyerId = req.user?.buyerId || req.body.buyerId || 1;
    const { listingId, quantity, agreedPrice } = req.body;

    if (!listingId || !quantity || !agreedPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide listing ID, quantity, and agreed price.',
      });
    }

    const orderResult = await withTransaction(async (client) => {
      // 1. Fetch listing and verify availability
      const lRes = await client.query(
        `SELECT l.*, f.user_id as farmer_user_id, p.name as crop_name
         FROM procurement_listings l
         JOIN farmers f ON l.farmer_id = f.id
         JOIN products p ON l.crop_id = p.id
         WHERE l.id = $1`,
        [listingId]
      );

      if (lRes.rows.length === 0) {
        throw new Error('Listing not found');
      }

      const listing = lRes.rows[0];
      const orderQty = Number(quantity);
      const price = Number(agreedPrice);
      const totalAmount = Math.round(orderQty * price);

      // 2. Insert into procurement_orders
      const oRes = await client.query(
        `INSERT INTO procurement_orders (
          listing_id, farmer_id, buyer_id, quantity, agreed_price, total_amount, order_status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING id, listing_id, farmer_id, buyer_id, quantity, agreed_price, total_amount, order_status, order_date`,
        [listing.id, listing.farmer_id, buyerId, orderQty, price, totalAmount]
      );

      const newOrder = oRes.rows[0];

      // 3. Update listing status if completely ordered
      if (orderQty >= Number(listing.quantity)) {
        await client.query(`UPDATE procurement_listings SET status = 'pending' WHERE id = $1`, [listing.id]);
      }

      // 4. Create Notification for Farmer
      await client.query(
        `INSERT INTO notifications (user_id, title, message, notification_type)
         VALUES ($1, 'New Procurement Order Received', $2, 'ORDER_UPDATE')`,
        [
          listing.farmer_user_id,
          `A new order of ${orderQty} Qtl for ${listing.crop_name} has been placed. Total Value: ₹${totalAmount.toLocaleString('en-IN')}.`,
        ]
      );

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Procurement order placed successfully',
      data: orderResult,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get All Orders (Filtered by Role / Current User)
 * GET /api/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { status, buyerId, farmerId } = req.query;

    let sql = `
      SELECT o.id, o.quantity, o.agreed_price, o.total_amount, o.order_status, o.order_date, o.completed_at,
             l.id as listing_id, l.location, l.quality_grade,
             p.name as crop_name, p.category, p.unit,
             f.id as farmer_id, f.farmer_id as farmer_code, u_f.name as farmer_name, u_f.phone as farmer_phone,
             b.id as buyer_id, b.organization_name as buyer_name, u_b.phone as buyer_phone
      FROM procurement_orders o
      JOIN procurement_listings l ON o.listing_id = l.id
      JOIN products p ON l.crop_id = p.id
      JOIN farmers f ON o.farmer_id = f.id
      JOIN users u_f ON f.user_id = u_f.id
      JOIN buyers b ON o.buyer_id = b.id
      JOIN users u_b ON b.user_id = u_b.id
      WHERE 1=1
    `;
    const params = [];
    let pIdx = 1;

    if (role === 'buyer' || buyerId) {
      const bId = buyerId || req.user?.buyerId;
      if (bId) {
        sql += ` AND o.buyer_id = $${pIdx}`;
        params.push(bId);
        pIdx++;
      }
    } else if (role === 'farmer' || farmerId) {
      const fId = farmerId || req.user?.farmerId;
      if (fId) {
        sql += ` AND o.farmer_id = $${pIdx}`;
        params.push(fId);
        pIdx++;
      }
    }

    if (status) {
      sql += ` AND o.order_status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    sql += ` ORDER BY o.order_date DESC`;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Get Order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT o.id, o.quantity, o.agreed_price, o.total_amount, o.order_status, o.order_date, o.completed_at,
             l.id as listing_id, l.location, l.quality_grade,
             p.name as crop_name, p.category, p.unit,
             f.id as farmer_id, f.farmer_id as farmer_code, u_f.name as farmer_name, u_f.phone as farmer_phone,
             b.id as buyer_id, b.organization_name as buyer_name, u_b.phone as buyer_phone
      FROM procurement_orders o
      JOIN procurement_listings l ON o.listing_id = l.id
      JOIN products p ON l.crop_id = p.id
      JOIN farmers f ON o.farmer_id = f.id
      JOIN users u_f ON f.user_id = u_f.id
      JOIN buyers b ON o.buyer_id = b.id
      JOIN users u_b ON b.user_id = u_b.id
      WHERE o.id = $1
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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
 * 4. Update Order Status
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide order status.' });
    }

    const completedAt = status === 'completed' ? new Date() : null;

    const updateSql = `
      UPDATE procurement_orders
      SET order_status = $1,
          completed_at = COALESCE($2, completed_at)
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateSql, [status, completedAt, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
