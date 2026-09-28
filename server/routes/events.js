const express = require('express');
const pool = require('../config/db');
const { authenticate, requireOrganizer } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validate');

const router = express.Router();

// GET /api/events?search=&category=&date=&location=&minPrice=&maxPrice=&available=
router.get('/', async (req, res) => {
  const { search, category, date, location, minPrice, maxPrice, available } = req.query;
  const clauses = [];
  const values = [];
  let i = 1;

  if (search) {
    clauses.push(`(e.name ILIKE $${i} OR e.venue ILIKE $${i} OR e.category ILIKE $${i} OR u.name ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }
  if (category) {
    clauses.push(`e.category = $${i}`);
    values.push(category);
    i++;
  }
  if (date) {
    clauses.push(`e.date = $${i}`);
    values.push(date);
    i++;
  }
  if (location) {
    clauses.push(`(e.venue ILIKE $${i} OR e.address ILIKE $${i})`);
    values.push(`%${location}%`);
    i++;
  }
  if (minPrice) {
    clauses.push(`e.ticket_price >= $${i}`);
    values.push(minPrice);
    i++;
  }
  if (maxPrice) {
    clauses.push(`e.ticket_price <= $${i}`);
    values.push(maxPrice);
    i++;
  }
  if (available === 'true') {
    clauses.push(`e.available_seats > 0`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT e.*, u.name AS organizer_name
       FROM events e JOIN users u ON u.id = e.organizer_id
       ${where}
       ORDER BY e.date ASC`,
      values
    );
    res.json({ events: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name AS organizer_name
       FROM events e JOIN users u ON u.id = e.organizer_id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event: result.rows[0] });
  } catch (err) {
    console.error(`Failed to fetch event ${req.params.id}:`, {
      code: err.code,
      message: err.message,
      detail: err.detail,
      stack: err.stack,
    });
    res.status(500).json({ message: 'Server error fetching event.' });
  }
});

// POST /api/events (organizer only)
router.post('/', authenticate, requireOrganizer, validateEvent, async (req, res) => {
  const { name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO events
        (organizer_id, name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats, available_seats)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12) RETURNING *`,
      [req.user.id, name, description, category, image || null, date, start_time, end_time, venue, address, ticket_price, total_seats]
    );
    res.status(201).json({ event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating event.' });
  }
});

// PUT /api/events/:id (organizer only, owner)
router.put('/:id', authenticate, requireOrganizer, validateEvent, async (req, res) => {
  const { name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (existing.rows[0].organizer_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    const bookingTotals = await client.query(
      `SELECT COALESCE(SUM(quantity), 0)::int AS booked
       FROM bookings WHERE event_id = $1 AND status != 'cancelled'`,
      [req.params.id]
    );
    const seatsBooked = bookingTotals.rows[0].booked;
    if (Number(total_seats) < seatsBooked) {
      await client.query('ROLLBACK');
      return res.status(400).json({ errors: { total_seats: `At least ${seatsBooked} seats are already booked.` } });
    }

    const result = await client.query(
      `UPDATE events SET name=$1, description=$2, category=$3, image=$4, date=$5, start_time=$6,
        end_time=$7, venue=$8, address=$9, ticket_price=$10, total_seats=$11, available_seats=$12
       WHERE id = $13 RETURNING *`,
      [name, description, category, image || null, date, start_time, end_time, venue, address, ticket_price, total_seats, Number(total_seats) - seatsBooked, req.params.id]
    );
    await client.query(
      `INSERT INTO notifications (user_id, event_id, kind, title, message)
       SELECT DISTINCT b.user_id, $1::integer, 'event_update', 'Event updated',
         'The details for "' || $2 || '" have changed. Check the event page for the latest information.'
       FROM bookings b
       WHERE b.event_id = $1::integer AND b.status = 'upcoming'
       ON CONFLICT (user_id, event_id, kind) WHERE event_id IS NOT NULL
       DO UPDATE SET title=EXCLUDED.title, message=EXCLUDED.message, is_read=FALSE, created_at=NOW()`,
      [req.params.id, name]
    );
    await client.query('COMMIT');
    res.json({ event: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Failed to update event ${req.params.id}:`, {
      code: err.code,
      message: err.message,
      detail: err.detail,
      stack: err.stack,
    });
    res.status(500).json({
      message: 'Server error updating event.',
      ...(process.env.NODE_ENV !== 'production' && {
        detail: err.message,
        code: err.code,
      }),
    });
  } finally {
    client.release();
  }
});

// DELETE /api/events/:id (organizer only, owner)
router.delete('/:id', authenticate, requireOrganizer, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (existing.rows[0].organizer_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'You can only delete your own events.' });
    }
    await client.query(
      `INSERT INTO notifications (user_id, event_id, kind, title, message)
       SELECT DISTINCT b.user_id, e.id, 'event_cancelled', 'Event cancelled',
         'The event "' || e.name || '" has been cancelled by the organizer.'
       FROM bookings b JOIN events e ON e.id = b.event_id
       WHERE e.id = $1::integer AND b.status = 'upcoming'
       ON CONFLICT (user_id, event_id, kind) WHERE event_id IS NOT NULL
       DO UPDATE SET title=EXCLUDED.title, message=EXCLUDED.message, is_read=FALSE, created_at=NOW()`,
      [req.params.id]
    );
    await client.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error deleting event.' });
  } finally {
    client.release();
  }
});

module.exports = router;
