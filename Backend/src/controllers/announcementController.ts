import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/auth';

export const getAllAnnouncements = async (_req: AuthRequest, res: Response) => {
  try {
    const announcements = await db('announcements').orderBy('is_pinned', 'desc').orderBy('created_at', 'desc');
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
};

export const getAnnouncementById = async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await db('announcements').where({ id: req.params.id }).first();
    if (!announcement) return res.status(404).json({ error: 'Announcement not found.' });
    res.json(announcement);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Failed to fetch announcement.' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, is_pinned } = req.body;
    const [announcement] = await db('announcements')
      .insert({ title, content, is_pinned: is_pinned || false })
      .returning('*');
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, is_pinned } = req.body;
    const [announcement] = await db('announcements')
      .where({ id: req.params.id })
      .update({ title, content, is_pinned })
      .returning('*');
    if (!announcement) return res.status(404).json({ error: 'Announcement not found.' });
    res.json(announcement);
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement.' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await db('announcements').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Announcement not found.' });
    res.json({ message: 'Announcement deleted.' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement.' });
  }
};
