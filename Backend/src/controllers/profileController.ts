import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await db('users').where({ id: req.user!.id }).first();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
      role: user.role,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, profile_image } = req.body;
    const userId = req.user!.id;

    // Check if email is already taken by another user
    if (email) {
      const existingEmail = await db('users').where({ email }).whereNot({ id: userId }).first();
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already in use.' });
      }
    }

    // Build update object with only defined values
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (profile_image !== undefined) updates.profile_image = profile_image;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    console.log(`Updating profile for user ${userId}, fields: ${Object.keys(updates).join(', ')}`);

    const [updated] = await db('users')
      .where({ id: userId })
      .update(updates)
      .returning(['id', 'username', 'name', 'email', 'profile_image', 'role']);

    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Update profile error:', error.message || error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await db('users').where({ id: userId }).first();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const bcrypt = require('bcrypt');
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await db('users').where({ id: userId }).update({ password_hash });

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password.' });
  }
};
