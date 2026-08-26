import { Router } from 'express';
import { Response } from 'express';
import db from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';
import { sendEmail, buildEmailHtml } from '../utils/email';

const router = Router();

// Middleware: admin only
const adminOnly = async (req: AuthRequest, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// ===== DASHBOARD STATS =====
router.get('/stats', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const [userCount] = await db('users').count('id as count');
    const [eventCount] = await db('events').count('id as count');
    const [announcementCount] = await db('announcements').count('id as count');
    const [galleryCount] = await db('gallery_items').count('id as count');
    const [subscriberCount] = await db('newsletter_subscribers').where({ is_active: true }).count('id as count');
    const [adminCount] = await db('users').where({ role: 'admin' }).count('id as count');

    // Recent registrations (last 7 days)
    const recentUsers = await db('users')
      .where('created_at', '>=', db.raw("NOW() - INTERVAL '7 days'"))
      .count('id as count');

    res.json({
      users: Number(userCount.count),
      events: Number(eventCount.count),
      announcements: Number(announcementCount.count),
      gallery: Number(galleryCount.count),
      subscribers: Number(subscriberCount.count),
      admins: Number(adminCount.count),
      recentUsers: Number(recentUsers[0].count),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ===== USER MANAGEMENT =====
router.get('/users', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await db('users')
      .select('id', 'username', 'name', 'email', 'role', 'is_active', 'created_at')
      .orderBy('created_at', 'desc');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.put('/users/:id/role', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    // Prevent demoting yourself
    if (Number(id) === req.user!.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote yourself.' });
    }
    await db('users').where({ id }).update({ role, updated_at: new Date() });
    res.json({ message: `User role updated to ${role}.` });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

router.put('/users/:id/status', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    // Prevent deactivating yourself
    if (Number(id) === req.user!.id) {
      return res.status(400).json({ error: 'Cannot deactivate yourself.' });
    }
    await db('users').where({ id }).update({ is_active, updated_at: new Date() });
    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

router.delete('/users/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete yourself.' });
    }
    await db('users').where({ id }).del();
    res.json({ message: 'User deleted.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ===== NEWSLETTER SUBSCRIBERS =====
router.get('/subscribers', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const subscribers = await db('newsletter_subscribers')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(subscribers);
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

// Public: subscribe endpoint (used by NewsletterForm)
router.post('/subscribers', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required.' });
    }
    const existing = await db('newsletter_subscribers').where({ email }).first();
    if (existing) {
      if (!existing.is_active) {
        await db('newsletter_subscribers').where({ id: existing.id }).update({ is_active: true });
        return res.json({ message: 'Welcome back! You have been re-subscribed.' });
      }
      return res.json({ message: 'You are already subscribed.' });
    }
    await db('newsletter_subscribers').insert({ email, name: name || null });
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe.' });
  }
});

router.delete('/subscribers/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db('newsletter_subscribers').where({ id }).update({ is_active: false });
    res.json({ message: 'Subscriber removed.' });
  } catch (error) {
    console.error('Remove subscriber error:', error);
    res.status(500).json({ error: 'Failed to remove subscriber.' });
  }
});

// ===== MASS EMAIL =====
router.post('/send-email', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, body, target } = req.body; // target: 'all' | 'subscribers' | 'members'
    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required.' });
    }

    let recipients: { email: string; name?: string }[] = [];

    if (target === 'subscribers' || target === 'all') {
      const subs = await db('newsletter_subscribers')
        .where({ is_active: true })
        .select('email', 'name');
      recipients.push(...subs);
    }

    if (target === 'members' || target === 'all') {
      const users = await db('users')
        .where('email', 'IS NOT NULL')
        .whereNot('email', '')
        .select('email', 'name');
      // Avoid duplicates
      const existingEmails = new Set(recipients.map((r) => r.email));
      for (const u of users) {
        if (!existingEmails.has(u.email)) {
          recipients.push({ email: u.email, name: u.name });
        }
      }
    }

    // Send emails to all recipients
    const html = buildEmailHtml(subject, body);
    let sentCount = 0;
    let failedCount = 0;
    const htmlForEmail = html;

    for (const recipient of recipients) {
      const result = await sendEmail({ to: recipient.email, subject, html: htmlForEmail });
      if (result.success) sentCount++;
      else failedCount++;
    }

    const status = failedCount === 0 ? 'sent' : sentCount === 0 ? 'failed' : 'partial';

    const [log] = await db('email_logs').insert({
      sent_by: req.user!.id,
      subject,
      body,
      recipient_count: recipients.length,
      status,
    }).returning('*');

    res.status(201).json({
      message: `${sentCount} email(s) sent${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
      log,
      recipients: recipients.map((r) => r.email),
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

router.get('/email-logs', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const logs = await db('email_logs')
      .select('email_logs.*', 'users.name as sender_name')
      .leftJoin('users', 'email_logs.sent_by', 'users.id')
      .orderBy('email_logs.created_at', 'desc')
      .limit(50);
    res.json(logs);
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: 'Failed to fetch email logs.' });
  }
});

// ===== PIN/UNPIN ANNOUNCEMENTS =====
router.put('/announcements/:id/pin', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_pinned } = req.body;
    await db('announcements').where({ id }).update({ is_pinned, updated_at: new Date() });
    res.json({ message: is_pinned ? 'Announcement pinned.' : 'Announcement unpinned.' });
  } catch (error) {
    console.error('Pin announcement error:', error);
    res.status(500).json({ error: 'Failed to pin announcement.' });
  }
});

export { router as adminRoutes };
