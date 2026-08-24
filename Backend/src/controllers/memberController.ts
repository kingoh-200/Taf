import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/auth';

export const getAllMembers = async (_req: AuthRequest, res: Response) => {
  try {
    // Get manually added members
    const manualMembers = await db('members')
      .select('id', 'name', 'role', 'bio', 'image_url', 'created_at')
      .orderBy('created_at', 'desc');

    // Get registered users (exclude password_hash)
    const registeredUsers = await db('users')
      .select('id', 'username', 'name', 'email', 'role', 'profile_image', 'created_at')
      .orderBy('created_at', 'desc');

    // Combine both lists, marking the source
    const allMembers = [
      ...registeredUsers.map((u) => ({
        id: `user-${u.id}`,
        name: u.name || u.username,
        role: u.role,
        bio: u.email ? `${u.email}` : null,
        image_url: u.profile_image,
        created_at: u.created_at,
        source: 'user',
      })),
      ...manualMembers.map((m) => ({
        ...m,
        source: 'manual',
      })),
    ];

    res.json(allMembers);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members.' });
  }
};

export const getMemberById = async (req: AuthRequest, res: Response) => {
  try {
    const member = await db('members').where({ id: req.params.id }).first();
    if (!member) return res.status(404).json({ error: 'Member not found.' });
    res.json(member);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to fetch member.' });
  }
};

export const createMember = async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, bio, image_url } = req.body;
    const [member] = await db('members')
      .insert({ name, role, bio, image_url })
      .returning('*');
    res.status(201).json(member);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Failed to create member.' });
  }
};

export const updateMember = async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, bio, image_url } = req.body;
    const [member] = await db('members')
      .where({ id: req.params.id })
      .update({ name, role, bio, image_url })
      .returning('*');
    if (!member) return res.status(404).json({ error: 'Member not found.' });
    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member.' });
  }
};

export const deleteMember = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await db('members').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Member not found.' });
    res.json({ message: 'Member deleted.' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member.' });
  }
};
