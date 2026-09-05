import { query } from '../config/db.js';

/**
 * 1. Create Farmer Profile
 * POST /api/farmers
 */
export const createFarmer = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { landArea, crops, bankAccountNumber, ifscCode, bankName } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    // Check if farmer profile already exists for user
    const existing = await query('SELECT id FROM farmers WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Farmer profile already exists for this user.' });
    }

    const farmerCode = `KP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO farmers (user_id, farmer_id, land_area, crops, bank_account_number, ifsc_code, bank_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, farmer_id, land_area, crops, bank_account_number, ifsc_code, bank_name, created_at`,
      [userId, farmerCode, Number(landArea) || 0, crops || 'Paddy (Rice)', bankAccountNumber, ifscCode, bankName || 'State Bank of India']
    );

    res.status(201).json({
      success: true,
      message: 'Farmer profile created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get Farmer by ID
 * GET /api/farmers/:id
 */
export const getFarmerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT f.id, f.user_id, f.farmer_id, f.land_area, f.crops, f.created_at,
              u.name, u.email, u.phone, u.village, u.district, u.state, u.address
       FROM farmers f
       JOIN users u ON f.user_id = u.id
       WHERE f.id::text = $1 OR f.user_id::text = $1 OR f.farmer_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
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
 * 3. Update Farmer Profile
 * PUT /api/farmers/:id or PUT /api/farmer/profile
 */
export const updateFarmer = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.user?.id;
    const { name, address, village, district, state, landArea, landAcres, crops, primaryCrop } = req.body;

    // 1. Update user info if provided
    if (name || address || village || district || state) {
      await query(
        `UPDATE users
         SET name = COALESCE($1, name),
             address = COALESCE($2, address),
             village = COALESCE($3, village),
             district = COALESCE($4, district),
             state = COALESCE($5, state),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = (SELECT user_id FROM farmers WHERE id::text = $6 OR user_id::text = $6 LIMIT 1)`,
        [name, address, village, district, state, targetId]
      );
    }

    // 2. Update farmer profile
    const fRes = await query(
      `UPDATE farmers
       SET land_area = COALESCE($1, land_area),
           crops = COALESCE($2, crops),
           updated_at = CURRENT_TIMESTAMP
       WHERE id::text = $3 OR user_id::text = $3
       RETURNING id, user_id, farmer_id, land_area, crops, updated_at`,
      [
        landArea || landAcres ? Number(landArea || landAcres) : null,
        crops || primaryCrop || null,
        targetId,
      ]
    );

    if (fRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      data: fRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Get Farmer's Procurement Listings
 * GET /api/farmers/:id/listings
 */
export const getFarmerListings = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT l.id, l.quantity, l.expected_price, l.location, l.quality_grade, l.harvest_date, l.status, l.created_at,
              p.id as crop_id, p.name as crop_name, p.category, p.minimum_support_price, p.unit
       FROM procurement_listings l
       JOIN products p ON l.crop_id = p.id
       JOIN farmers f ON l.farmer_id = f.id
       WHERE f.id::text = $1 OR f.user_id::text = $1 OR f.farmer_id = $1
       ORDER BY l.created_at DESC`,
      [id]
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
