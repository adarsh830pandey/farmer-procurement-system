import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kisan_procurement_sih_secure_jwt_secret_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate signed JWT Token for user / farmer / admin
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Generate unique alphanumeric Booking ID
 */
export const generateBookingId = (district = 'GZB') => {
  const code = district.slice(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK-2026-${code}-${rand}`;
};

/**
 * Generate next Mandi Token Number (e.g. A102, A103)
 */
export const generateTokenNumber = (series = 'A', count = 100) => {
  return `${series}${count}`;
};

/**
 * Generate unique Weighment Slip Number (J-Form)
 */
export const generateWeighmentSlip = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MW-${rand}`;
};

/**
 * Generate PFMS DBT Transaction Reference
 */
export const generatePaymentReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PFMS-DBT-${dateStr}-${rand}`;
};
