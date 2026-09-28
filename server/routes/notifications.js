const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, event_id, kind, title, message)
       SELECT DISTINCT b.user_id, e.id, 'event_reminder', 'Event reminder',
         'Your event "' || e.name || '" starts within the next 24 hours.'
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       WHERE b.user_id = $1
         AND b.status = 'upcoming'
         AND e.date + e.start_time > CURRENT_TIMESTAMP
         AND e.date + e.start_time <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
       ON CONFLICT (user_id, event_id, kind) WHERE event_id IS NOT NULL DO NOTHING`,
      [req.user.id]
    );
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ notification: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating notification.' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating notifications.' });
  }
});

module.exports = router;
