const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  const { name, email, mobile, password, role } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ errors: { email: 'An account with this email already exists.' } });
    }

    const hashed = await bcrypt.hash(password, 10);
    const finalRole = role === 'organizer' ? 'organizer' : 'user';

    const result = await pool.query(
      `INSERT INTO users (name, email, mobile, password, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), email.toLowerCase(), mobile, hashed, finalRole]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: sanitize(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/auth/me (edit profile)
router.put('/me', authenticate, async (req, res) => {
  const { name, mobile } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), mobile = COALESCE($2, mobile) WHERE id = $3 RETURNING *',
      [name, mobile, req.user.id]
    );
    res.json({ user: sanitize(result.rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

module.exports = router;
