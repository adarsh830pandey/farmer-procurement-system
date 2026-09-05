import { query } from '../config/db.js';

/**
 * 1. Get Logged-in User Notifications
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;

    const result = await query(
      `SELECT id, user_id, title, message, notification_type, is_read as "isRead", created_at as "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 25`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      notifications: result.rows, // backward compatibility
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
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (err) {
    next(err);
  }
};
