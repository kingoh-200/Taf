# 🏛️ School Club Website

A full-stack website for managing a school club, built with **React**, **Node.js/Express**, and **PostgreSQL**.

## Features

- **Home page** with announcements and upcoming events
- **Events** – view and manage club events
- **Members** – showcase the team
- **Gallery** – photo gallery (coming soon)
- **Admin dashboard** – manage content with authentication

## Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Frontend   | React 18, TypeScript, Vite  |
| Backend    | Node.js, Express, Knex.js   |
| Database   | PostgreSQL                  |
| Auth       | JWT + bcrypt                |

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (local or cloud like Supabase/Neon)

### 1. Create the Database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE club_website;"
```

### 2. Set Up the Backend

```bash
cd Backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (creates tables)
npm run migrate

# Seed sample data (optional)
npm run seed

# Start the development server
npm run dev
```

The backend will run on `http://localhost:3001`.

### 3. Set Up the Frontend

```bash
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173` and proxy API requests to the backend.

### 4. Login

- **Admin login:** `admin` / `admin123`

## Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── db/             # Database config
│   │   ├── middleware/      # Auth, error handling
│   │   ├── migrations/     # Database schema
│   │   ├── routes/         # API routes
│   │   ├── seeds/          # Sample data
│   │   └── types/          # TypeScript types
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── api/            # API client & types
│   │   ├── components/     # Navbar, Footer, Layout
│   │   ├── hooks/          # Custom hooks
│   │   └── pages/          # Page components
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                  | Auth Required | Description          |
| ------ | ------------------------- | ------------- | -------------------- |
| POST   | `/api/auth/register`      | No            | Register new user    |
| POST   | `/api/auth/login`         | No            | Login                |
| GET    | `/api/events`             | No            | List all events      |
| POST   | `/api/events`             | Admin         | Create event         |
| PUT    | `/api/events/:id`         | Admin         | Update event         |
| DELETE | `/api/events/:id`         | Admin         | Delete event         |
| GET    | `/api/members`            | No            | List all members     |
| POST   | `/api/members`            | Admin         | Add member           |
| PUT    | `/api/members/:id`        | Admin         | Update member        |
| DELETE | `/api/members/:id`        | Admin         | Delete member        |
| GET    | `/api/announcements`      | No            | List announcements   |
| POST   | `/api/announcements`      | Admin         | Create announcement  |
| PUT    | `/api/announcements/:id`  | Admin         | Update announcement  |
| DELETE | `/api/announcements/:id`  | Admin         | Delete announcement  |

## Next Steps

- [ ] Add image upload for events, members, and gallery
- [ ] Add pagination for lists
- [ ] Add email notifications
- [ ] Deploy to production (Vercel + Railway + Supabase)
