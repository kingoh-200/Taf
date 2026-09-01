import { Router } from 'express';
import db from '../db';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/content/:page — public, returns all sections for a page
router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const rows = await db('site_content')
      .where({ page_key: page })
      .orderBy('id', 'asc');
    res.json(rows);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content.' });
  }
});

// PUT /api/content/:page — admin only, bulk update sections
router.put('/:page', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only.' });
    }
    const { page } = req.params;
    const { sections } = req.body as { sections: { section_key: string; title?: string; body?: string; meta?: any }[] };

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'sections must be an array.' });
    }

    for (const sec of sections) {
      const existing = await db('site_content')
        .where({ page_key: page, section_key: sec.section_key })
        .first();

      if (existing) {
        await db('site_content')
          .where({ page_key: page, section_key: sec.section_key })
          .update({
            title: sec.title ?? existing.title,
            body: sec.body ?? existing.body,
            meta: sec.meta ? JSON.stringify(sec.meta) : existing.meta,
            updated_by: req.user!.id,
            updated_at: new Date(),
          });
      } else {
        await db('site_content').insert({
          page_key: page,
          section_key: sec.section_key,
          title: sec.title || null,
          body: sec.body || null,
          meta: sec.meta ? JSON.stringify(sec.meta) : '{}',
          updated_by: req.user!.id,
        });
      }
    }

    // Return updated content
    const rows = await db('site_content')
      .where({ page_key: page })
      .orderBy('id', 'asc');
    res.json(rows);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content.' });
  }
});

// GET /api/content — admin only, returns all content for management
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only.' });
    }
    const rows = await db('site_content').orderBy('page_key', 'asc');
    res.json(rows);
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({ error: 'Failed to fetch content.' });
  }
});

export { router as contentRoutes };
