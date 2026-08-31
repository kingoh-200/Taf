import { Router } from 'express';
import { Response } from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/profileController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import db from '../db';

const router = Router();

// Public: get any user's projects and achievements
router.get('/:id/projects', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await db('member_projects').where({ user_id: req.params.id }).orderBy('created_at', 'desc');
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

router.get('/:id/achievements', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const achievements = await db('member_achievements').where({ user_id: req.params.id }).orderBy('created_at', 'desc');
    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements.' });
  }
});

// Protected: manage own projects (or admin)
router.post('/:id/projects', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    const { title, description, tech_stack, link, image_url } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const [project] = await db('member_projects').insert({ user_id: userId, title, description, tech_stack, link, image_url }).returning('*');
    res.status(201).json(project);
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ error: 'Failed to add project.' });
  }
});

router.delete('/:id/projects/:projectId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    await db('member_projects').where({ id: req.params.projectId, user_id: userId }).del();
    res.json({ message: 'Project deleted.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// Protected: manage own achievements (or admin)
router.post('/:id/achievements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    const { title, description, icon, date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const [achievement] = await db('member_achievements').insert({ user_id: userId, title, description, icon: icon || 'fa-trophy', date }).returning('*');
    res.status(201).json(achievement);
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({ error: 'Failed to add achievement.' });
  }
});

router.delete('/:id/achievements/:achievementId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    await db('member_achievements').where({ id: req.params.achievementId, user_id: userId }).del();
    res.json({ message: 'Achievement deleted.' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ error: 'Failed to delete achievement.' });
  }
});

// Protected: own profile
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
router.put('/password', authenticate, updatePassword);

export { router as profileRoutes };
