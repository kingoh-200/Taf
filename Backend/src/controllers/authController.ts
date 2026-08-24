import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../db';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, name, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if username or email already exists
    const existingUsername = await db('users').where({ username }).first();
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    if (email) {
      const existingEmail = await db('users').where({ email }).first();
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered.' });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const isAdminEmail = email?.toLowerCase() === 'kingoina254@gmail.com';
    const [user] = await db('users')
      .insert({
        username,
        password_hash,
        name: name || null,
        email: email || null,
        role: isAdminEmail ? 'admin' : 'member',
      })
      .returning(['id', 'username', 'name', 'email', 'role']);

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string;
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn } as SignOptions
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register.' });
  }
};

const ADMIN_EMAIL = 'kingoina254@gmail.com';

// Strip sensitive fields based on role
function sanitizeUser(user: any, requestorRole?: string) {
  const safe: any = {
    id: user.id,
    username: user.username,
    name: user.name,
    profile_image: user.profile_image || null,
    role: user.role,
  };
  // Only show email if it's not the admin email, or if the requestor is admin
  if (user.email && (user.email.toLowerCase() !== ADMIN_EMAIL || requestorRole === 'admin')) {
    safe.email = user.email;
  }
  return safe;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await db('users').where({ username }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Auto-promote if admin email
    if (user.email?.toLowerCase() === ADMIN_EMAIL && user.role !== 'admin') {
      await db('users').where({ id: user.id }).update({ role: 'admin' });
      user.role = 'admin';
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string;
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn } as SignOptions
    );

    res.json({ user: sanitizeUser(user, user.role), token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
};

export { sanitizeUser };
