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
import { galleryRoutes } from './routes/gallery';
import { adminRoutes } from './routes/admin';
import { contentRoutes } from './routes/content';
import { contactRoutes } from './routes/contact';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contact', contactRoutes);

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
    await db.raw(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL DEFAULT 'image',
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        caption VARCHAR(500),
        category VARCHAR(50) DEFAULT 'general',
        like_count INTEGER DEFAULT 0,
        save_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    // Add category column if missing (for existing databases)
    await db.raw(`
      DO $$ BEGIN
        ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS gallery_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES gallery_items(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, item_id)
      )
    `);    await db.raw(`
      CREATE TABLE IF NOT EXISTS gallery_saves (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES gallery_items(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, item_id)
      )
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS gallery_comments (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES gallery_items(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.raw(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        sent_by INTEGER REFERENCES users(id),
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        recipient_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS member_projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tech_stack VARCHAR(500),
        link VARCHAR(500),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.raw(`
      CREATE TABLE IF NOT EXISTS member_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT 'fa-trophy',
        date VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tables created/verified');

    // Site content table for editable pages
    await db.raw(`
      CREATE TABLE IF NOT EXISTS site_content (
        id SERIAL PRIMARY KEY,
        page_key VARCHAR(100) NOT NULL UNIQUE,
        section_key VARCHAR(100) NOT NULL,
        title VARCHAR(500),
        body TEXT,
        meta JSONB DEFAULT '{}',
        updated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Seed default contact page content if empty
    const contentCount = await db('site_content').count('id as count').first();
    if (contentCount && Number(contentCount.count) === 0) {
      await db('site_content').insert([
        { page_key: 'contact', section_key: 'hero', title: 'Contact Us', body: 'We would love to hear from you. Reach out to Teens Aloud Foundation.' },
        { page_key: 'contact', section_key: 'info', title: 'Get In Touch', body: JSON.stringify({ email: 'info@teensaloud.com', phone: '+254 700 000 000', address: 'Nairobi, Kenya', website: 'https://teensaloud.com' }) },
        { page_key: 'contact', section_key: 'hours', title: 'Office Hours', body: JSON.stringify({ weekdays: 'Monday - Friday: 8:00 AM - 5:00 PM', saturday: 'Saturday: 9:00 AM - 1:00 PM', sunday: 'Sunday: Closed' }) },
        { page_key: 'home', section_key: 'hero', title: 'EMPOWERING TEENS. BUILDING FUTURES.', body: 'Creating opportunities, inspiring growth, and building a stronger generation.' },
        { page_key: 'about', section_key: 'mission', title: 'Our Mission', body: 'To challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ.' },
        { page_key: 'about', section_key: 'vision', title: 'Our Vision', body: 'Eternal interest in teens everywhere.' },
      ]);
      console.log('✅ Default site content seeded');
    }

    // Add new columns if they don't exist (safe to run multiple times)
    const addColumnIfNotExists = async (table: string, column: string, type: string) => {
      try {
        await db.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`);
      } catch {
        // Column may already exist or dialect doesn't support IF NOT EXISTS
      }
    };
    await addColumnIfNotExists('users', 'title', 'VARCHAR(255)');
    await addColumnIfNotExists('users', 'department', 'VARCHAR(255)');
    await addColumnIfNotExists('users', 'location', 'VARCHAR(255)');
    await addColumnIfNotExists('users', 'skills', 'TEXT');
    await addColumnIfNotExists('users', 'social_link', 'VARCHAR(500)');
    await addColumnIfNotExists('users', 'is_active', 'BOOLEAN DEFAULT TRUE');
    await addColumnIfNotExists('members', 'title', 'VARCHAR(255)');
    await addColumnIfNotExists('members', 'department', 'VARCHAR(255)');
    await addColumnIfNotExists('members', 'location', 'VARCHAR(255)');
    await addColumnIfNotExists('members', 'skills', 'TEXT');
    await addColumnIfNotExists('members', 'social_link', 'VARCHAR(500)');
    await addColumnIfNotExists('members', 'is_active', 'BOOLEAN DEFAULT TRUE');
    console.log('✅ Columns verified');

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
