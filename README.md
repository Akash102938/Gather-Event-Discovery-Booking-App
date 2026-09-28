# Gather — Event Discovery & Booking

A responsive, full-stack web app for discovering local events, booking tickets, and managing event attendance. Gather includes separate **attendee** and **organizer** experiences.

> This is a web application built with React. It is not a React Native mobile app.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [API overview](#api-overview)
- [Production build](#production-build)
- [Notes](#notes)

## Features

### Attendees

- Register, log in, and edit a profile.
- Browse, search, and filter events by category, date, location, price, and availability.
- View event details and save favorite events.
- Book tickets with quantity checks, a price breakdown, and live seat availability.
- View digital ticket details and sort bookings into upcoming, completed, and cancelled.
- Cancel eligible upcoming bookings; released seats become available again.
- Receive booking updates, event reminders, event updates, and event cancellation notifications.

### Organizers

- View event and booking statistics in an organizer dashboard.
- Create, edit, and delete events.
- Review attendee details and search the attendee list.
- See seat availability and booking counts for each event.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Axios |
| Backend | Node.js, Express.js, REST API, JWT, bcrypt |
| Database | PostgreSQL |

## Project structure

```text
gather-event-booking-app/
├── client/                     # React + TypeScript web application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── types/
├── server/                     # Express REST API
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── schema.sql              # PostgreSQL schema and sample data
└── README.md
```

## Requirements

- Node.js 18 or newer and npm.
- PostgreSQL 14 or newer, running locally or reachable over the network.
- Git (optional, for cloning and contributing).

## Getting started

Run each long-running command in its own terminal. The commands below use Windows PowerShell.

### 1. Get the source code

```powershell
git clone https://github.com/Akash102938/Gather-Event-Discovery-Booking-App.git
cd Gather-Event-Discovery-Booking-App
```

If you already have the project folder, open PowerShell there instead.

### 2. Create and initialize the database

Create a PostgreSQL database named `event_booking`, then run the schema from the project root:

```powershell
createdb event_booking
psql -d event_booking -f server/schema.sql
```

The schema creates the application tables and seeds demo accounts and sample events. It is safe to run again and does not drop existing tables or data. If `createdb` or `psql` is not recognized, add PostgreSQL's `bin` directory to `PATH`, or run the SQL file using pgAdmin.

### 3. Configure and start the backend

In a new terminal:

```powershell
cd server
Copy-Item .env.example .env
npm install
npm run dev
```

Update `server/.env` with your local PostgreSQL settings and a private, randomly generated `JWT_SECRET`. The API runs at `http://localhost:5000`; its health endpoint is `http://localhost:5000/api/health`.

### 4. Configure and start the frontend

In another terminal:

```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local address Vite prints (usually `http://localhost:5173`). The frontend uses `VITE_API_URL` from `client/.env`; its default is `http://localhost:5000/api`.

### macOS and Linux environment-file commands

Use `cp .env.example .env` instead of PowerShell's `Copy-Item`.

## Demo accounts

The sample accounts are created by `server/schema.sql`.

| Role | Email | Password |
| --- | --- | --- |
| Attendee | `user@demo.com` | `Password123` |
| Organizer | `organizer@demo.com` | `Password123` |




Use the organizer account to open **Profile → Organizer dashboard**.

## API overview

All endpoints are prefixed with `/api`. Authenticated endpoints require a bearer token.

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/me` |
| Events | `GET /events`, `GET /events/:id`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id` |
| Bookings | `POST /bookings`, `GET /bookings`, `GET /bookings/:id`, `PUT /bookings/:id/cancel` |
| Favorites | `POST /favorites`, `GET /favorites`, `DELETE /favorites/:eventId` |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| Organizer | `GET /organizer/dashboard`, `GET /organizer/events`, `GET /organizer/events/:id/attendees` |

`GET /events` supports `search`, `category`, `date`, `location`, `minPrice`, `maxPrice`, and `available` query parameters.

## Production build

Build the frontend:

```powershell
cd client
npm run build
```

The static production site is written to `client/dist/`. Start the API with `npm start` from `server/` and deploy it with PostgreSQL behind HTTPS. Configure the production `VITE_API_URL`, database environment variables, and a strong `JWT_SECRET`.

## Notes

- Booking uses a PostgreSQL transaction and locks the event row while checking and updating seat availability.
- The digital ticket includes a visual QR-code placeholder; it is not a scannable ticket code.
- This project is a responsive website, so an Android APK is not applicable.
- `.env` files contain local configuration and must never be committed. Use the supplied `.env.example` templates when setting up a new environment.
