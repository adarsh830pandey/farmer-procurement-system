import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../config/db.js';
import { generateToken } from '../utils/tokenGenerator.js';

/**
 * 1. Register Farmer
 * POST /api/auth/register
 */
export const registerFarmer = async (req, res, next) => {
  try {
    const {
      name,
      mobile,
      password,
      aadhaarLast4,
      state,
      district,
      village,
      address,
      landAcres,
      primaryCrop,
      estimatedQuantityQuintals,
      bankDetails,
    } = req.body;

    if (!name || !mobile || !password || !village || !district || !state) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Name, Mobile, Password, Village, District, State).',
      });
    }

    // Check if farmer with this mobile number already exists
    const existing = await query('SELECT id, mobile_number FROM farmers WHERE mobile_number = $1', [mobile]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A farmer is already registered with this mobile number. Please login.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate Farmer ID (e.g. KP-2026-XXXX)
    const farmerCode = `KP-2026-${mobile.slice(-4)}`;

    const bankAccount = bankDetails?.accountNumber || '';
    const ifscCode = bankDetails?.ifscCode || '';

    // Insert into PostgreSQL
    const insertSql = `
      INSERT INTO farmers (
        farmer_code, name, mobile_number, aadhaar_last4, password_hash,
        address, village, district, state, land_acres, primary_crop,
        estimated_quantity, bank_account, ifsc_code, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'VERIFIED')
      RETURNING id, farmer_code, name, mobile_number, aadhaar_last4, village, district, state, land_acres, primary_crop, estimated_quantity, bank_account, ifsc_code, status, registration_date
    `;

    const result = await query(insertSql, [
      farmerCode,
      name,
      mobile,
      aadhaarLast4 || mobile.slice(-4),
      passwordHash,
      address || '',
      village,
      district,
      state,
      Number(landAcres) || 0,
      primaryCrop || 'Paddy (Rice)',
      Number(estimatedQuantityQuintals) || 0,
      bankAccount,
      ifscCode,
    ]);

    const newFarmer = result.rows[0];

    // Create initial welcome notification
    await query(
      `INSERT INTO notifications (farmer_id, type, message) VALUES ($1, $2, $3)`,
      [
        newFarmer.id,
        'REGISTRATION_SUCCESS',
        `Welcome ${newFarmer.name}! Your Kisan Procurement ID is ${newFarmer.farmer_code}. You can now book procurement slots online.`,
      ]
    );

    // Generate JWT token
    const token = generateToken({
      id: newFarmer.id,
      role: 'farmer',
      mobile: newFarmer.mobile_number,
      name: newFarmer.name,
    });

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      token,
      user: {
        id: newFarmer.id,
        farmerCode: newFarmer.farmer_code,
        name: newFarmer.name,
        mobile: newFarmer.mobile_number,
        village: newFarmer.village,
        district: newFarmer.district,
        state: newFarmer.state,
        landAcres: newFarmer.land_acres,
        primaryCrop: newFarmer.primary_crop,
        estimatedQuantity: newFarmer.estimated_quantity,
        status: newFarmer.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Farmer Login
 * POST /api/auth/login
 */
export const loginFarmer = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and password.',
      });
    }

    const result = await query(
      `SELECT * FROM farmers WHERE mobile_number = $1`,
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No registered farmer found with this mobile number.',
      });
    }

    const farmer = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, farmer.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      });
    }

    const token = generateToken({
      id: farmer.id,
      role: 'farmer',
      mobile: farmer.mobile_number,
      name: farmer.name,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: farmer.id,
        farmerCode: farmer.farmer_code,
        name: farmer.name,
        mobile: farmer.mobile_number,
        aadhaarLast4: farmer.aadhaar_last4,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        address: farmer.address,
        landAcres: farmer.land_acres,
        primaryCrop: farmer.primary_crop,
        bankAccount: farmer.bank_account,
        ifscCode: farmer.ifsc_code,
        status: farmer.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Admin / Centre Officer Login
 * POST /api/auth/admin-login
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { username, email, password, centreCode } = req.body;
    const identifier = username || email;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide officer user ID/email and password.',
      });
    }

    const result = await query(
      `SELECT * FROM admins WHERE username = $1 OR email = $1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid officer credentials. User not found.',
      });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect admin password.',
      });
    }

    const token = generateToken({
      id: admin.id,
      role: 'admin',
      username: admin.username,
      name: admin.name,
      centreCode: centreCode || admin.centre_code,
    });

    res.status(200).json({
      success: true,
      message: 'Admin authorization granted',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        centreCode: centreCode || admin.centre_code,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Get Current Logged-in User Profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'admin') {
      const result = await query(`SELECT id, username, email, name, role, centre_code, created_at FROM admins WHERE id = $1`, [req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      return res.status(200).json({ success: true, user: result.rows[0], role: 'admin' });
    } else {
      const result = await query(`SELECT id, farmer_code, name, mobile_number, aadhaar_last4, address, village, district, state, land_acres, primary_crop, estimated_quantity, bank_account, ifsc_code, status, registration_date FROM farmers WHERE id = $1`, [req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Farmer not found' });
      }
      return res.status(200).json({ success: true, user: result.rows[0], role: 'farmer' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Update Farmer Profile
 * PUT /api/farmer/profile
 */
export const updateFarmerProfile = async (req, res, next) => {
  try {
    const farmerId = req.user?.id || req.body.id;
    if (!farmerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { name, address, village, district, state, landAcres, primaryCrop } = req.body;

    const updateSql = `
      UPDATE farmers
      SET name = COALESCE($1, name),
          address = COALESCE($2, address),
          village = COALESCE($3, village),
          district = COALESCE($4, district),
          state = COALESCE($5, state),
          land_acres = COALESCE($6, land_acres),
          primary_crop = COALESCE($7, primary_crop),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, farmer_code, name, mobile_number, aadhaar_last4, address, village, district, state, land_acres, primary_crop, bank_account, ifsc_code, status
    `;

    const result = await query(updateSql, [
      name,
      address,
      village,
      district,
      state,
      landAcres ? Number(landAcres) : null,
      primaryCrop,
      farmerId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully in database',
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
