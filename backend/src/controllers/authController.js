import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../config/db.js';
import { generateToken } from '../utils/tokenGenerator.js';

/**
 * 1. Register User (Farmer, Buyer, or Admin)
 * POST /api/auth/register
 */
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      mobile, // support both phone and mobile
      password,
      role = 'farmer',
      address,
      village,
      district,
      state,
      // Farmer specific
      landArea,
      landAcres,
      crops,
      primaryCrop,
      bankAccountNumber,
      ifscCode,
      bankDetails,
      // Buyer specific
      organizationName,
      licenseNumber,
    } = req.body;

    const userPhone = phone || mobile;

    if (!name || !userPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Name, Phone/Mobile, and Password).',
      });
    }

    // Check if phone already registered
    const existingUser = await query('SELECT id, phone FROM users WHERE phone = $1', [userPhone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please login.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = ['farmer', 'buyer', 'admin'].includes(role) ? role : 'farmer';

    const registeredUser = await withTransaction(async (client) => {
      // 1. Insert into users table
      const uRes = await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role, address, village, district, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, email, phone, role, address, village, district, state, created_at`,
        [
          name,
          email || null,
          userPhone,
          passwordHash,
          userRole,
          address || '',
          village || '',
          district || 'Ghaziabad',
          state || 'Uttar Pradesh',
        ]
      );
      const newUser = uRes.rows[0];

      let profileData = {};

      // 2. Insert into role-specific table
      if (userRole === 'farmer') {
        const farmerCode = `KP-2026-${userPhone.slice(-4)}`;
        const fRes = await client.query(
          `INSERT INTO farmers (user_id, farmer_id, land_area, crops, bank_account_number, ifsc_code)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, farmer_id, land_area, crops`,
          [
            newUser.id,
            farmerCode,
            Number(landArea || landAcres) || 0.0,
            crops || primaryCrop || 'Paddy (Rice)',
            bankAccountNumber || bankDetails?.accountNumber || '',
            ifscCode || bankDetails?.ifscCode || '',
          ]
        );
        profileData = fRes.rows[0];

        // Create welcome notification
        await client.query(
          `INSERT INTO notifications (user_id, title, message, notification_type)
           VALUES ($1, 'Welcome to Kisan Procurement', $2, 'REGISTRATION_SUCCESS')`,
          [newUser.id, `Welcome ${newUser.name}! Your Farmer ID is ${farmerCode}. You can now book slots and list crops.`]
        );
      } else if (userRole === 'buyer') {
        const bRes = await client.query(
          `INSERT INTO buyers (user_id, organization_name, license_number, address)
           VALUES ($1, $2, $3, $4)
           RETURNING id, organization_name, license_number`,
          [
            newUser.id,
            organizationName || `${name} Enterprises`,
            licenseNumber || `LIC-${Date.now().toString().slice(-6)}`,
            address || '',
          ]
        );
        profileData = bRes.rows[0];
      }

      return {
        ...newUser,
        profile: profileData,
      };
    });

    const token = generateToken({
      id: registeredUser.id,
      role: registeredUser.role,
      phone: registeredUser.phone,
      name: registeredUser.name,
      farmerId: registeredUser.profile?.id,
      farmerCode: registeredUser.profile?.farmer_id,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: registeredUser,
      user: registeredUser, // backward compatibility
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Login User
 * POST /api/auth/login
 */
export const loginUser = async (req, res, next) => {
  try {
    const { phone, mobile, email, username, password } = req.body;
    const identifier = phone || mobile || email || username;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone/email and password.',
      });
    }

    const result = await query(
      `SELECT u.*,
              f.id as farmer_db_id, f.farmer_id as farmer_code, f.land_area, f.crops,
              b.id as buyer_db_id, b.organization_name
       FROM users u
       LEFT JOIN farmers f ON u.id = f.user_id
       LEFT JOIN buyers b ON u.id = b.user_id
       WHERE u.phone = $1 OR u.email = $1 OR u.name = $1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      });
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      phone: user.phone,
      name: user.name,
      farmerId: user.farmer_db_id,
      farmerCode: user.farmer_code,
      buyerId: user.buyer_db_id,
    });

    // Strip password_hash
    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: user,
      user, // backward compatibility for frontend
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Admin Login Gateway
 * POST /api/auth/admin-login
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { username, email, password, centreCode } = req.body;
    const identifier = username || email || 'admin@kisan.gov.in';

    const result = await query(
      `SELECT * FROM users WHERE (phone = $1 OR email = $1 OR name = $1) AND role IN ('admin', 'officer')`,
      [identifier]
    );

    if (result.rows.length === 0) {
      // Fallback check on admins table
      const legacyAdmin = await query(`SELECT * FROM admins WHERE username = $1 OR email = $1`, [identifier]);
      if (legacyAdmin.rows.length > 0) {
        const isMatch = await bcrypt.compare(password, legacyAdmin.rows[0].password_hash);
        if (isMatch) {
          const token = generateToken({
            id: legacyAdmin.rows[0].id,
            role: 'admin',
            name: legacyAdmin.rows[0].name,
            centreCode: centreCode || legacyAdmin.rows[0].centre_code,
          });
          return res.status(200).json({
            success: true,
            message: 'Admin authorization granted',
            token,
            admin: legacyAdmin.rows[0],
            data: legacyAdmin.rows[0],
          });
        }
      }

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
      name: admin.name,
      centreCode: centreCode || 'MANDI-GZB-01',
    });

    delete admin.password_hash;

    res.status(200).json({
      success: true,
      message: 'Admin authorization granted',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        centreCode: centreCode || 'MANDI-GZB-01',
      },
      data: admin,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Get Current Authenticated User (GET /api/auth/me)
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.address, u.village, u.district, u.state, u.created_at,
              f.id as farmer_db_id, f.farmer_id as farmer_code, f.land_area, f.crops,
              b.id as buyer_db_id, b.organization_name, b.license_number
       FROM users u
       LEFT JOIN farmers f ON u.id = f.user_id
       LEFT JOIN buyers b ON u.id = b.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: user,
      user, // backward compatibility
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

// Aliases for backward compatibility
export const registerFarmer = registerUser;
export const loginFarmer = loginUser;
