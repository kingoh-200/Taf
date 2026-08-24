import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import knex from 'knex';

import { eventRoutes } from './routes/events';
import { memberRoutes } from './routes/members';
import { announcementRoutes } from './routes/announcements';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profile';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Auto-run migrations on startup (production only)
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ No DATABASE_URL found, skipping migrations');
    return;
  }
  try {
    const db = knex({
      client: 'pg',
      connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      },
    });

    console.log('🔄 Running migrations...');
    await db.raw(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100),
        bio TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tables created/verified');

    // Seed admin user if not exists
    const bcrypt = require('bcrypt');
    const adminExists = await db('users').where({ username: 'ADMIN' }).first();
    if (!adminExists) {
      const password_hash = await bcrypt.hash('123456', 10);
      await db('users').insert({
        username: 'ADMIN',
        password_hash,
        name: 'Admin',
        email: 'kingoina254@gmail.com',
        role: 'admin',
      });
      console.log('✅ Admin user seeded');
    }

    // Seed sample data if events table is empty
    const eventCount = await db('events').count('id as count').first();
    if (eventCount && Number(eventCount.count) === 0) {
      await db('events').insert([
        {
          title: 'Welcome Meeting',
          description: 'Kickoff meeting for the new semester!',
          event_date: new Date('2025-09-15T14:00:00'),
          location: 'Room 201, Main Building',
        },
        {
          title: 'Hackathon 2025',
          description: '48-hour coding marathon.',
          event_date: new Date('2025-10-20T09:00:00'),
          location: 'Computer Lab A',
        },
      ]);
      await db('members').insert([
        { name: 'Alice Johnson', role: 'President', bio: 'CS senior.' },
        { name: 'Bob Smith', role: 'Vice President', bio: 'Engineering junior.' },
      ]);
      await db('announcements').insert([
        { title: 'Welcome Back!', content: 'New semester, new opportunities!', is_pinned: true },
      ]);
      console.log('✅ Sample data seeded');
    }

    await db.destroy();
  } catch (error: any) {
    console.error('⚠️ Database init error:', error.message || error);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    await initializeDatabase();
  }
});

export default app;
