const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/favorites  { event_id }
router.post('/', authenticate, async (req, res) => {
  const { event_id } = req.body;
  if (!event_id) return res.status(400).json({ message: 'event_id is required.' });
  try {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, event_id) VALUES ($1, $2)
       ON CONFLICT (user_id, event_id) DO NOTHING RETURNING *`,
      [req.user.id, event_id]
    );
    res.status(201).json({ favorite: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding favorite.' });
  }
});

// GET /api/favorites
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.* FROM favorites f JOIN events e ON e.id = f.event_id
       WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ favorites: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching favorites.' });
  }
});

// DELETE /api/favorites/:eventId
router.delete('/:eventId', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND event_id = $2', [req.user.id, req.params.eventId]);
    res.json({ message: 'Removed from favorites.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error removing favorite.' });
  }
});

module.exports = router;
