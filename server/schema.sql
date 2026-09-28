-- Event Discovery & Booking App - PostgreSQL Schema

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'organizer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('upcoming', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(60) NOT NULL,
  image TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue VARCHAR(180) NOT NULL,
  address VARCHAR(255) NOT NULL,
  ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type VARCHAR(60) NOT NULL DEFAULT 'General',
  quantity INTEGER NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  kind VARCHAR(40) NOT NULL DEFAULT 'general',
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS event_id INTEGER REFERENCES events(id) ON DELETE SET NULL;
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS kind VARCHAR(40) NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_event_kind
  ON notifications(user_id, event_id, kind) WHERE event_id IS NOT NULL;

-- Seed an organizer + a few events for quick testing
-- Password for both seed users is: Password123
-- (bcrypt hash generated with 10 salt rounds)
INSERT INTO users (name, email, mobile, password, role) VALUES
('Aria Organizer', 'organizer@demo.com', '9990000001', '$2a$10$t6d347dZnTp1THavexQX8ezgj9anwCK5B0bE5Fu6mglqXHnUl.ezG', 'organizer'),
('Sam User', 'user@demo.com', '9990000002', '$2a$10$t6d347dZnTp1THavexQX8ezgj9anwCK5B0bE5Fu6mglqXHnUl.ezG', 'user')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO events (organizer_id, name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats, available_seats)
SELECT u.id, seed.name, seed.description, seed.category, seed.image, seed.date, seed.start_time, seed.end_time,
       seed.venue, seed.address, seed.ticket_price, seed.total_seats, seed.available_seats
FROM users u
CROSS JOIN (VALUES
  ('Indie Sound Festival', 'A night of independent music across three stages.', 'Music', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3', DATE '2026-11-14', TIME '18:00', TIME '23:30', 'Riverside Grounds', '12 Riverside Ave, Ranchi', 899.00, 500, 480),
  ('Startup Founders Meetup', 'Networking and lightning talks for early-stage founders.', 'Business', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b', DATE '2026-10-02', TIME '10:00', TIME '14:00', 'Innovation Hub', '4 Tech Park, Jamshedpur', 0.00, 150, 120),
  ('React Conf: Local Edition', 'Talks and workshops on the latest in React and TypeScript.', 'Technology', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678', DATE '2026-12-05', TIME '09:00', TIME '17:00', 'Convention Centre', '9 MG Road, Dhanbad', 499.00, 300, 300),
  ('Sunset Rooftop Sessions', 'An open-air evening of live acoustic sets, local food, and golden-hour views.', 'Music', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a', DATE '2026-10-18', TIME '17:30', TIME '21:30', 'Skyline Terrace', '18 Circular Road, Ranchi', 599.00, 180, 180),
  ('Champions on the Court', 'A high-energy community basketball tournament with music and courtside snacks.', 'Sports', 'https://images.unsplash.com/photo-1546519638-68e109498ffc', DATE '2026-11-07', TIME '09:00', TIME '17:00', 'Birsa Sports Complex', 'Main Road, Ranchi', 250.00, 240, 240),
  ('Design Futures Summit', 'A day of talks and hands-on sessions about thoughtful digital product design.', 'Technology', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72', DATE '2026-12-12', TIME '09:30', TIME '16:30', 'The Foundry', 'Bistupur, Jamshedpur', 799.00, 220, 220),
  ('Winter Makers Market', 'Meet independent makers and find ceramics, prints, textiles, and handmade gifts.', 'Workshops', 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf', DATE '2027-01-16', TIME '11:00', TIME '18:00', 'Heritage Courtyard', 'Lalpur, Ranchi', 100.00, 350, 350),
  ('Voices of Tomorrow', 'An inspiring evening of ideas and stories from educators, founders, and changemakers.', 'Education', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2', DATE '2027-02-06', TIME '16:00', TIME '20:00', 'Civic Auditorium', 'Sakchi, Jamshedpur', 399.00, 400, 400),
  ('Garden City Food & Jazz', 'A relaxed outdoor food festival with regional favourites and live jazz performances.', 'Entertainment', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', DATE '2027-03-20', TIME '12:00', TIME '21:00', 'Botanical Garden Lawn', 'Morabadi, Ranchi', 699.00, 500, 500),
  ('Moonlight Folk & Firelight', 'Gather under the stars for regional folk bands, warm food, and an intimate outdoor music night.', 'Music', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', DATE '2026-12-19', TIME '18:00', TIME '22:00', 'Forest Edge Amphitheatre', 'Kanke Road, Ranchi', 549.00, 260, 260),
  ('Ranchi City Run 2027', 'A welcoming 5K and 10K city run with timed routes, hydration stops, and finisher medals.', 'Sports', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3', DATE '2027-01-10', TIME '06:00', TIME '10:00', 'Morabadi Grounds', 'Morabadi, Ranchi', 299.00, 800, 800),
  ('Open Source Build Night', 'A practical evening for developers to collaborate on open-source projects and share what they build.', 'Technology', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', DATE '2027-02-20', TIME '17:00', TIME '21:00', 'Digital Works Lab', 'Adityapur Industrial Area, Jamshedpur', 199.00, 140, 140),
  ('Small Business Growth Forum', 'Local founders share practical lessons on finance, marketing, and growing a resilient business.', 'Business', 'https://images.unsplash.com/photo-1556761175-b413da4baf72', DATE '2027-01-23', TIME '09:30', TIME '15:00', 'Cedar Conference Hall', 'Bistupur, Jamshedpur', 449.00, 180, 180),
  ('Science Discovery Lab Day', 'Interactive demonstrations and friendly experiments make science exciting for curious learners.', 'Education', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d', DATE '2026-11-21', TIME '10:00', TIME '15:00', 'Jharkhand Science Centre', 'Ratu Road, Ranchi', 149.00, 220, 220),
  ('Pottery & Chai Studio', 'Shape your own clay piece in a relaxed beginner-friendly pottery session with tea and local treats.', 'Workshops', 'https://images.unsplash.com/photo-1565193298595-6c6b197a4b7a', DATE '2026-10-24', TIME '14:00', TIME '17:00', 'Clay House Studio', 'Lalpur, Ranchi', 699.00, 32, 32),
  ('Lanterns & Local Stories', 'An atmospheric evening of live theatre, music, and short stories from local performers.', 'Entertainment', 'https://images.unsplash.com/photo-1503095396549-807759245b35', DATE '2027-03-06', TIME '18:30', TIME '21:30', 'Nawa Rang Theatre', 'Sakchi, Jamshedpur', 399.00, 300, 300)
) AS seed(name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats, available_seats)
WHERE u.email = 'organizer@demo.com'
  AND NOT EXISTS (
    SELECT 1 FROM events existing
    WHERE existing.organizer_id = u.id AND existing.name = seed.name
  );
