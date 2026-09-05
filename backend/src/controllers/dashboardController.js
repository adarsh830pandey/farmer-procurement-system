import { query } from '../config/db.js';

/**
 * 1. Farmer Dashboard Metrics
 * GET /api/dashboard/farmer
 */
export const getFarmerDashboard = async (req, res, next) => {
  try {
    const farmerId = req.user?.farmerId || req.query.farmerId || 1;

    const [listingsRes, ordersRes, earningsRes] = await Promise.all([
      query(
        `SELECT COUNT(*)::int as total_listings,
                COALESCE(SUM(CASE WHEN status = 'available' THEN quantity ELSE 0 END), 0)::numeric as available_quantity
         FROM procurement_listings WHERE farmer_id = $1`,
        [farmerId]
      ),
      query(
        `SELECT COUNT(*)::int as total_orders,
                COUNT(CASE WHEN order_status = 'completed' THEN 1 END)::int as completed_orders,
                COUNT(CASE WHEN order_status = 'pending' THEN 1 END)::int as pending_orders
         FROM procurement_orders WHERE farmer_id = $1`,
        [farmerId]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::numeric as total_earnings
         FROM payments WHERE farmer_id = $1 AND payment_status IN ('successful', 'PAID')`,
        [farmerId]
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalListings: listingsRes.rows[0].total_listings || 0,
        availableQuantity: Number(listingsRes.rows[0].available_quantity) || 0,
        ordersReceived: ordersRes.rows[0].total_orders || 0,
        completedOrders: ordersRes.rows[0].completed_orders || 0,
        pendingOrders: ordersRes.rows[0].pending_orders || 0,
        totalEarnings: Number(earningsRes.rows[0].total_earnings) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Buyer Dashboard Metrics
 * GET /api/dashboard/buyer
 */
export const getBuyerDashboard = async (req, res, next) => {
  try {
    const buyerId = req.user?.buyerId || req.query.buyerId || 1;

    const [cropsRes, ordersRes, valueRes] = await Promise.all([
      query(`SELECT COUNT(DISTINCT crop_id)::int as available_crops FROM procurement_listings WHERE status = 'available'`),
      query(
        `SELECT COUNT(*)::int as orders_placed,
                COUNT(CASE WHEN order_status = 'pending' THEN 1 END)::int as pending_orders,
                COUNT(CASE WHEN order_status = 'completed' THEN 1 END)::int as completed_orders
         FROM procurement_orders WHERE buyer_id = $1`,
        [buyerId]
      ),
      query(
        `SELECT COALESCE(SUM(total_amount), 0)::numeric as total_procurement_value
         FROM procurement_orders WHERE buyer_id = $1 AND order_status = 'completed'`,
        [buyerId]
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        availableCrops: cropsRes.rows[0].available_crops || 0,
        ordersPlaced: ordersRes.rows[0].orders_placed || 0,
        pendingOrders: ordersRes.rows[0].pending_orders || 0,
        completedOrders: ordersRes.rows[0].completed_orders || 0,
        totalProcurementValue: Number(valueRes.rows[0].total_procurement_value) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Admin Dashboard Metrics
 * GET /api/dashboard/admin
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [farmersRes, buyersRes, listingsRes, ordersRes, procurementValRes] = await Promise.all([
      query(`SELECT COUNT(*)::int as total_farmers FROM farmers`),
      query(`SELECT COUNT(*)::int as total_buyers FROM buyers`),
      query(`SELECT COUNT(*)::int as total_listings FROM procurement_listings`),
      query(`SELECT COUNT(*)::int as total_orders, COUNT(CASE WHEN order_status = 'completed' THEN 1 END)::int as completed_orders FROM procurement_orders`),
      query(`SELECT COALESCE(SUM(amount), 0)::numeric as total_amount FROM payments WHERE payment_status IN ('successful', 'PAID')`),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFarmers: farmersRes.rows[0].total_farmers || 0,
        totalBuyers: buyersRes.rows[0].total_buyers || 0,
        totalListings: listingsRes.rows[0].total_listings || 0,
        totalOrders: ordersRes.rows[0].total_orders || 0,
        completedTransactions: ordersRes.rows[0].completed_orders || 0,
        totalProcurementAmount: Number(procurementValRes.rows[0].total_amount) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
