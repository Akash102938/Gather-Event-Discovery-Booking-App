const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9]{10}$/;
const CATEGORIES = ['Music', 'Sports', 'Technology', 'Business', 'Education', 'Workshops', 'Entertainment'];

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);
  return hours <= 23 && minutes <= 59;
}

function validateRegister(req, res, next) {
  const { name, email, mobile, password, confirmPassword } = req.body;
  const errors = {};

  if (typeof name !== 'string' || name.trim().length < 2) errors.name = 'Full name is required.';
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) errors.email = 'A valid email is required.';
  if (typeof mobile !== 'string' || !MOBILE_RE.test(mobile)) errors.mobile = 'Mobile number must be 10 digits.';
  if (typeof password !== 'string' || password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  if (Object.keys(errors).length) return res.status(400).json({ errors });
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = {};
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) errors.email = 'A valid email is required.';
  if (typeof password !== 'string' || !password) errors.password = 'Password is required.';
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  next();
}

function validateEvent(req, res, next) {
  const { name, description, category, date, start_time, end_time, venue, address, ticket_price, total_seats } = req.body;
  const errors = {};

  if (typeof name !== 'string' || name.trim().length < 3) errors.name = 'Event name is required.';
  if (typeof description !== 'string' || description.trim().length < 10) errors.description = 'Description should be at least 10 characters.';
  if (typeof category !== 'string' || !CATEGORIES.includes(category)) errors.category = 'Choose a valid event category.';
  if (!isValidDate(date)) errors.date = 'A valid event date is required.';
  else if (date < new Date().toISOString().slice(0, 10)) errors.date = 'Date cannot be in the past.';
  if (!isValidTime(start_time)) errors.start_time = 'A valid start time is required.';
  if (!isValidTime(end_time)) errors.end_time = 'A valid end time is required.';
  if (start_time && end_time && start_time >= end_time) errors.end_time = 'End time must be after start time.';
  if (typeof venue !== 'string' || !venue.trim()) errors.venue = 'Venue is required.';
  if (typeof address !== 'string' || !address.trim()) errors.address = 'Address is required.';
  if (ticket_price === undefined || ticket_price === '' || !Number.isFinite(Number(ticket_price)) || Number(ticket_price) < 0) errors.ticket_price = 'Ticket price must be 0 or more.';
  if (!Number.isInteger(Number(total_seats)) || Number(total_seats) < 1) errors.total_seats = 'Total seats must be a whole number of at least 1.';

  if (Object.keys(errors).length) return res.status(400).json({ errors });
  next();
}

function validateBooking(req, res, next) {
  const { event_id, ticket_type, quantity } = req.body;
  const errors = {};
  if (!Number.isInteger(Number(event_id)) || Number(event_id) < 1) errors.event_id = 'A valid event is required.';
  if (!['General', 'VIP', 'Group'].includes(ticket_type)) errors.ticket_type = 'Choose a valid ticket type.';
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) errors.quantity = 'Quantity must be a whole number of at least 1.';
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  next();
}

module.exports = { validateRegister, validateLogin, validateEvent, validateBooking };
