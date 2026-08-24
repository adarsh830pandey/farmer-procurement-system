import { verifyToken } from '../utils/tokenGenerator.js';
import { query } from '../config/db.js';

/**
 * Protect routes: Verify JWT Bearer token and attach authenticated user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No authentication token provided. Please login.',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please login again.',
    });
  }
};

/**
 * Restrict to Admin / Centre Officers only
 */
export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'officer')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access restricted to authorized Procurement Centre Officers only.',
    });
  }
};

/**
 * Optional Auth: Attach user if token is present, but continue if not
 */
export const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      req.user = verifyToken(token);
    } catch (e) {
      // ignore invalid optional token
    }
  }
  next();
};
