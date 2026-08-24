import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/auth';

export const getAllEvents = async (_req: AuthRequest, res: Response) => {
  try {
    const events = await db('events').orderBy('event_date', 'desc');
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const event = await db('events').where({ id: req.params.id }).first();
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, event_date, location, image_url } = req.body;
    const [event] = await db('events')
      .insert({ title, description, event_date, location, image_url })
      .returning('*');
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, event_date, location, image_url } = req.body;
    const [event] = await db('events')
      .where({ id: req.params.id })
      .update({ title, description, event_date, location, image_url, updated_at: new Date() })
      .returning('*');
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await db('events').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
};
