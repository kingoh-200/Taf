import { Router } from 'express';
import db from '../db';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Create contact_messages table if not exists
async function ensureTable() {
  try {
    await db.raw(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (error) {
    console.error('Failed to create contact_messages table:', error);
  }
}

// Run on import
ensureTable();

// POST /api/contact — send a message (public, rate-limited)
router.post('/', rateLimit(5, 60 * 1000), optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const [saved] = await db('contact_messages').insert({
      user_id: req.user?.id || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    }).returning('id');

    res.status(201).json({
      message: 'Your message has been received! We will get back to you soon.',
      id: saved.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// GET /api/contact — admin only, get all messages
router.get('/', async (req: AuthRequest, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized.' });

    const jwt = await import('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || '') as any;
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

    const messages = await db('contact_messages')
      .orderBy('created_at', 'desc')
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// PUT /api/contact/:id/read — mark as read
router.put('/:id/read', async (req: AuthRequest, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized.' });

    const jwt = await import('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || '') as any;
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

    await db('contact_messages').where({ id: req.params.id }).update({ is_read: true });
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update.' });
  }
});

// DELETE /api/contact/:id — admin only
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized.' });

    const jwt = await import('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || '') as any;
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

    await db('contact_messages').where({ id: req.params.id }).del();
    res.json({ message: 'Deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete.' });
  }
});

export { router as contactRoutes };
