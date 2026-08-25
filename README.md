# 🏛️ Teens Aloud Foundation Website

A full-stack website for managing the Teens Aloud Foundation Kenya club, built with **React**, **Node.js/Express**, and **PostgreSQL**.

## Features

- **Home page** with announcements and upcoming events
- **Events** – view and manage club events
- **Members** – showcase the team with rich profile cards
- **Gallery** – photo and video sharing with likes and saves
- **Admin dashboard** – manage content with authentication
- **Dark mode** – toggle between light and dark themes
- **Mobile responsive** – works on all screen sizes
- **Image hosting** – Cloudinary integration for profile pictures and gallery

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 18, TypeScript, Vite          |
| Backend    | Node.js, Express, Knex.js           |
| Database   | PostgreSQL (Supabase)               |
| Auth       | JWT + bcrypt                        |
| Storage    | Cloudinary                          |
| Hosting    | Vercel (frontend) + Render (backend) |

## Getting Started

### Prerequisites

- Node.js (v18+)

### 1. Set Up the Backend

```bash
cd Backend
npm install
npm run dev
```

The backend will run on `http://localhost:3001`.

### 2. Set Up the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 3. Login

- **Admin login:** `ADMIN` / `123456`

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
│   │   ├── components/     # Navbar, Footer, Skeletons
│   │   ├── pages/          # Page components
│   │   └── utils/          # Cloudinary, image processing
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
| GET    | `/api/gallery`            | No            | List gallery items   |
| POST   | `/api/gallery`            | Yes           | Upload to gallery    |
| POST   | `/api/gallery/:id/like`   | Yes           | Like/unlike item     |
| POST   | `/api/gallery/:id/save`   | Yes           | Save/unsave item     |
| DELETE | `/api/gallery/:id`        | Owner/Admin   | Delete gallery item  |
| GET    | `/api/profile`            | Yes           | Get own profile      |
| PUT    | `/api/profile`            | Yes           | Update own profile   |
