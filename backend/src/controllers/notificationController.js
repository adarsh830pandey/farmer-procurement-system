import { query } from '../config/db.js';

/**
 * 1. Get Logged-in Farmer Notifications
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const farmerId = req.user?.id || 1;

    const result = await query(
      `SELECT id, type, message, is_read as "isRead", created_at as "createdAt"
       FROM notifications
       WHERE farmer_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [farmerId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      notifications: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Mark Notification as Read
 * PUT /api/notifications/:id/read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(`UPDATE notifications SET is_read = TRUE WHERE id = $1`, [id]);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};
