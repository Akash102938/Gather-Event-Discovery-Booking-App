const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validate');

const router = express.Router();

const SERVICE_FEE_RATE = 0.05; // 5% convenience charge

async function notify(client, userId, title, message) {
  await client.query(
    'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
    [userId, title, message]
  );
}

// POST /api/bookings
router.post('/', authenticate, validateBooking, async (req, res) => {
  const { event_id, ticket_type, quantity } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const eventResult = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [event_id]);
    const event = eventResult.rows[0];
    if (!event) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (event.available_seats <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'This event is sold out.' });
    }
    if (quantity > event.available_seats) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Only ${event.available_seats} seats left.` });
    }

    const subtotal = Number(event.ticket_price) * Number(quantity);
    const fee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
    const total = Math.round((subtotal + fee) * 100) / 100;

    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, event_id, ticket_type, quantity, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, 'upcoming') RETURNING *`,
      [req.user.id, event_id, ticket_type, quantity, total]
    );

    await client.query(
      'UPDATE events SET available_seats = available_seats - $1 WHERE id = $2',
      [quantity, event_id]
    );

    await notify(
      client,
      req.user.id,
      'Booking confirmed',
      `Your booking for "${event.name}" (${quantity} ticket${quantity > 1 ? 's' : ''}) is confirmed.`
    );

    await client.query('COMMIT');

    res.status(201).json({
      booking: { ...bookingResult.rows[0], event_name: event.name, venue: event.venue, date: event.date, start_time: event.start_time },
      breakdown: { subtotal, fee, total },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error creating booking.' });
  } finally {
    client.release();
  }
});

// GET /api/bookings?status=upcoming|completed|cancelled
router.get('/', authenticate, async (req, res) => {
  const { status } = req.query;
  const clauses = ['b.user_id = $1'];
  const values = [req.user.id];
  if (status) {
    clauses.push("(CASE WHEN b.status = 'upcoming' AND e.date + e.end_time < CURRENT_TIMESTAMP THEN 'completed'::booking_status ELSE b.status END) = $2");
    values.push(status);
  }
  try {
    const result = await pool.query(
      `SELECT b.*, e.name AS event_name, u.name AS user_name, e.date, e.start_time, e.venue, e.image, e.category,
        CASE WHEN b.status = 'upcoming' AND e.date + e.end_time < CURRENT_TIMESTAMP THEN 'completed'::booking_status ELSE b.status END AS status
       FROM bookings b JOIN events e ON e.id = b.event_id JOIN users u ON u.id = b.user_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY b.created_at DESC`,
      values
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching bookings.' });
  }
});

// GET /api/bookings/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, e.name AS event_name, u.name AS user_name, e.date, e.start_time, e.end_time, e.venue, e.address, e.image,
        CASE WHEN b.status = 'upcoming' AND e.date + e.end_time < CURRENT_TIMESTAMP THEN 'completed'::booking_status ELSE b.status END AS status
       FROM bookings b JOIN events e ON e.id = b.event_id JOIN users u ON u.id = b.user_id
       WHERE b.id = $1 AND b.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching booking.' });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookingResult = await client.query(
      `SELECT b.*, e.date AS event_date, e.name AS event_name,
        e.date + e.start_time <= CURRENT_TIMESTAMP AS event_started,
        e.date + e.end_time < CURRENT_TIMESTAMP AS event_completed
       FROM bookings b JOIN events e ON e.id = b.event_id
       WHERE b.id = $1 AND b.user_id = $2
       FOR UPDATE OF b, e`,
      [req.params.id, req.user.id]
    );
    const booking = bookingResult.rows[0];
    if (!booking) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking.status !== 'upcoming') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Only upcoming bookings can be cancelled.' });
    }
    if (booking.event_started) {
      if (booking.event_completed) {
        await client.query("UPDATE bookings SET status = 'completed' WHERE id = $1", [booking.id]);
        await client.query('COMMIT');
        return res.status(400).json({ message: 'This event has already ended, so the booking cannot be cancelled.' });
      }
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'This event has already started, so the booking cannot be cancelled.' });
    }

    await client.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [booking.id]);
    const eventResult = await client.query(
      'UPDATE events SET available_seats = available_seats + $1 WHERE id = $2 RETURNING name',
      [booking.quantity, booking.event_id]
    );

    await notify(
      client,
      req.user.id,
      'Booking cancelled',
      `Your booking for "${eventResult.rows[0].name}" has been cancelled and seats released.`
    );

    await client.query('COMMIT');

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error cancelling booking.' });
  } finally {
    client.release();
  }
});

module.exports = router;
