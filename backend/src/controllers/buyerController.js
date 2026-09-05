import { query } from '../config/db.js';

/**
 * 1. Get All Buyers
 * GET /api/buyers
 */
export const getAllBuyers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT b.id, b.organization_name, b.license_number, b.address, b.created_at,
              u.name as contact_person, u.email, u.phone, u.district, u.state
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.organization_name ASC`
    );

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
 * 2. Get Buyer by ID
 * GET /api/buyers/:id
 */
export const getBuyerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT b.id, b.organization_name, b.license_number, b.address, b.created_at,
              u.name as contact_person, u.email, u.phone, u.district, u.state
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       WHERE b.id::text = $1 OR b.user_id::text = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
