import { query } from '../config/db.js';

/**
 * 1. Create Procurement Listing
 * POST /api/procurement/listings
 */
export const createListing = async (req, res, next) => {
  try {
    const farmerId = req.user?.farmerId || req.body.farmerId || 1;
    const { cropId, cropName, quantity, expectedPrice, location, qualityGrade, harvestDate } = req.body;

    if (!quantity || !expectedPrice || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quantity, expected price, and location.',
      });
    }

    // Resolve Crop ID
    let resolvedCropId = cropId || 1;
    if (!cropId && cropName) {
      const cRes = await query(`SELECT id FROM products WHERE name ILIKE $1 LIMIT 1`, [`%${cropName}%`]);
      if (cRes.rows.length > 0) {
        resolvedCropId = cRes.rows[0].id;
      }
    }

    const insertSql = `
      INSERT INTO procurement_listings (
        farmer_id, crop_id, quantity, expected_price, location, quality_grade, harvest_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'available')
      RETURNING id, farmer_id, crop_id, quantity, expected_price, location, quality_grade, harvest_date, status, created_at
    `;

    const result = await query(insertSql, [
      farmerId,
      resolvedCropId,
      Number(quantity),
      Number(expectedPrice),
      location,
      qualityGrade || 'FAQ Grade A',
      harvestDate || new Date().toISOString().split('T')[0],
    ]);

    res.status(201).json({
      success: true,
      message: 'Procurement listing created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get All Procurement Listings with Filters
 * GET /api/procurement/listings
 */
export const getListings = async (req, res, next) => {
  try {
    const { crop, location, district, state, quality, minPrice, maxPrice, status } = req.query;

    let sql = `
      SELECT l.id, l.quantity, l.expected_price, l.location, l.quality_grade, l.harvest_date, l.status, l.created_at,
             p.id as crop_id, p.name as crop_name, p.category, p.minimum_support_price, p.unit,
             f.id as farmer_id, f.farmer_id as farmer_code, u.name as farmer_name, u.phone as farmer_phone,
             u.village, u.district, u.state
      FROM procurement_listings l
      JOIN products p ON l.crop_id = p.id
      JOIN farmers f ON l.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let pIdx = 1;

    if (crop) {
      sql += ` AND (p.name ILIKE $${pIdx} OR p.category ILIKE $${pIdx})`;
      params.push(`%${crop}%`);
      pIdx++;
    }

    if (location || district) {
      const locTerm = location || district;
      sql += ` AND (l.location ILIKE $${pIdx} OR u.district ILIKE $${pIdx} OR u.village ILIKE $${pIdx})`;
      params.push(`%${locTerm}%`);
      pIdx++;
    }

    if (state) {
      sql += ` AND u.state ILIKE $${pIdx}`;
      params.push(`%${state}%`);
      pIdx++;
    }

    if (quality) {
      sql += ` AND l.quality_grade ILIKE $${pIdx}`;
      params.push(`%${quality}%`);
      pIdx++;
    }

    if (minPrice) {
      sql += ` AND l.expected_price >= $${pIdx}`;
      params.push(Number(minPrice));
      pIdx++;
    }

    if (maxPrice) {
      sql += ` AND l.expected_price <= $${pIdx}`;
      params.push(Number(maxPrice));
      pIdx++;
    }

    if (status) {
      sql += ` AND l.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    sql += ` ORDER BY l.created_at DESC`;

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
 * 3. Get Listing by ID
 * GET /api/procurement/listings/:id
 */
export const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT l.id, l.quantity, l.expected_price, l.location, l.quality_grade, l.harvest_date, l.status, l.created_at,
             p.id as crop_id, p.name as crop_name, p.category, p.minimum_support_price, p.unit,
             f.id as farmer_id, f.farmer_id as farmer_code, u.name as farmer_name, u.phone as farmer_phone,
             u.village, u.district, u.state
      FROM procurement_listings l
      JOIN products p ON l.crop_id = p.id
      JOIN farmers f ON l.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE l.id = $1
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
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
 * 4. Update Listing
 * PUT /api/procurement/listings/:id
 */
export const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, expectedPrice, location, qualityGrade, status } = req.body;

    const updateSql = `
      UPDATE procurement_listings
      SET quantity = COALESCE($1, quantity),
          expected_price = COALESCE($2, expected_price),
          location = COALESCE($3, location),
          quality_grade = COALESCE($4, quality_grade),
          status = COALESCE($5, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const result = await query(updateSql, [
      quantity ? Number(quantity) : null,
      expectedPrice ? Number(expectedPrice) : null,
      location,
      qualityGrade,
      status,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Delete Listing
 * DELETE /api/procurement/listings/:id
 */
export const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM procurement_listings WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Listing removed successfully',
    });
  } catch (err) {
    next(err);
  }
};
