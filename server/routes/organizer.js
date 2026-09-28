const express = require('express');
const pool = require('../config/db');
const { authenticate, requireOrganizer } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireOrganizer);

// GET /api/organizer/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totals = await pool.query(
      `SELECT
         COUNT(*)::int AS total_events,
         COUNT(*) FILTER (WHERE date >= CURRENT_DATE)::int AS upcoming_events
       FROM events WHERE organizer_id = $1`,
      [req.user.id]
    );

    const bookingTotals = await pool.query(
      `SELECT
         COUNT(*)::int AS total_bookings,
         COALESCE(SUM(b.quantity), 0)::int AS total_attendees
       FROM bookings b JOIN events e ON e.id = b.event_id
       WHERE e.organizer_id = $1 AND b.status != 'cancelled'`,
      [req.user.id]
    );

    res.json({
      total_events: totals.rows[0].total_events,
      upcoming_events: totals.rows[0].upcoming_events,
      total_bookings: bookingTotals.rows[0].total_bookings,
      total_attendees: bookingTotals.rows[0].total_attendees,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error loading dashboard.' });
  }
});

// GET /api/organizer/events
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*,
        (SELECT COUNT(*)::int FROM bookings b WHERE b.event_id = e.id AND b.status != 'cancelled') AS booking_count
       FROM events e WHERE e.organizer_id = $1 ORDER BY e.date ASC`,
      [req.user.id]
    );
    res.json({ events: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching organizer events.' });
  }
});

// GET /api/organizer/events/:id/attendees?search=
router.get('/events/:id/attendees', async (req, res) => {
  const { search } = req.query;
  try {
    const eventCheck = await pool.query('SELECT * FROM events WHERE id = $1 AND organizer_id = $2', [req.params.id, req.user.id]);
    if (!eventCheck.rows[0]) return res.status(404).json({ message: 'Event not found.' });

    const clauses = ['b.event_id = $1'];
    const values = [req.params.id];
    if (search) {
      clauses.push('(u.name ILIKE $2 OR u.email ILIKE $2)');
      values.push(`%${search}%`);
    }

    const result = await pool.query(
      `SELECT u.name, u.email, u.mobile, b.quantity, b.id AS booking_id,
        CASE WHEN b.status = 'upcoming' AND e.date + e.end_time < CURRENT_TIMESTAMP THEN 'completed'::booking_status ELSE b.status END AS status
       FROM bookings b JOIN users u ON u.id = b.user_id
       JOIN events e ON e.id = b.event_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY b.created_at DESC`,
      values
    );
    res.json({ attendees: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching attendees.' });
  }
});

module.exports = router;
