import { Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/auth';

// Get all gallery items with like/save counts and current user's status
export const getGalleryItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const items = await db('gallery_items')
      .select(
        'gallery_items.*',
        'users.username',
        'users.name as author_name',
        'users.profile_image as author_image',
      )
      .leftJoin('users', 'gallery_items.user_id', 'users.id')
      .orderBy('gallery_items.created_at', 'desc');

    // If user is logged in, check which items they've liked/saved
    let likedIds: number[] = [];
    let savedIds: number[] = [];
    if (userId) {
      const likes = await db('gallery_likes').where({ user_id: userId }).pluck('item_id');
      const saves = await db('gallery_saves').where({ user_id: userId }).pluck('item_id');
      likedIds = likes;
      savedIds = saves;
    }

    const itemsWithStatus = items.map((item) => ({
      ...item,
      liked: likedIds.includes(item.id),
      saved: savedIds.includes(item.id),
    }));

    res.json(itemsWithStatus);
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items.' });
  }
};

// Upload a new gallery item
export const createGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { url, thumbnail_url, type, caption } = req.body;
    const userId = req.user!.id;

    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    const [item] = await db('gallery_items')
      .insert({
        user_id: userId,
        url,
        thumbnail_url: thumbnail_url || null,
        type: type || 'image',
        caption: caption || null,
      })
      .returning('*');

    // Fetch with user info
    const fullItem = await db('gallery_items')
      .select(
        'gallery_items.*',
        'users.username',
        'users.name as author_name',
        'users.profile_image as author_image',
      )
      .leftJoin('users', 'gallery_items.user_id', 'users.id')
      .where('gallery_items.id', item.id)
      .first();

    res.status(201).json({ ...fullItem, liked: false, saved: false });
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ error: 'Failed to upload item.' });
  }
};

// Delete a gallery item (owner or admin only)
export const deleteGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const item = await db('gallery_items').where({ id }).first();
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    if (item.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await db('gallery_items').where({ id }).del();
    res.json({ message: 'Item deleted.' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ error: 'Failed to delete item.' });
  }
};

// Toggle like on a gallery item
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await db('gallery_likes').where({ user_id: userId, item_id: id }).first();

    if (existing) {
      // Unlike
      await db('gallery_likes').where({ id: existing.id }).del();
      await db('gallery_items').where({ id }).decrement('like_count', 1);
    } else {
      // Like
      await db('gallery_likes').insert({ user_id: userId, item_id: id });
      await db('gallery_items').where({ id }).increment('like_count', 1);
    }

    // Return updated item
    const item = await db('gallery_items').where({ id }).first();
    res.json({ liked: !existing, like_count: item.like_count });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
};

// Toggle save (bookmark) on a gallery item
export const toggleSave = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await db('gallery_saves').where({ user_id: userId, item_id: id }).first();

    if (existing) {
      // Unsave
      await db('gallery_saves').where({ id: existing.id }).del();
      await db('gallery_items').where({ id }).decrement('save_count', 1);
    } else {
      // Save
      await db('gallery_saves').insert({ user_id: userId, item_id: id });
      await db('gallery_items').where({ id }).increment('save_count', 1);
    }

    // Return updated item
    const item = await db('gallery_items').where({ id }).first();
    res.json({ saved: !existing, save_count: item.save_count });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({ error: 'Failed to toggle save.' });
  }
};

// Get saved items for a user (for profile page)
export const getSavedItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const items = await db('gallery_saves')
      .select(
        'gallery_items.*',
        'users.username',
        'users.name as author_name',
        'users.profile_image as author_image',
      )
      .innerJoin('gallery_items', 'gallery_saves.item_id', 'gallery_items.id')
      .leftJoin('users', 'gallery_items.user_id', 'users.id')
      .where('gallery_saves.user_id', userId)
      .orderBy('gallery_saves.created_at', 'desc');

    res.json(items);
  } catch (error) {
    console.error('Get saved items error:', error);
    res.status(500).json({ error: 'Failed to fetch saved items.' });
  }
};

// Get comments for a gallery item
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await db('gallery_comments')
      .select(
        'gallery_comments.*',
        'users.username',
        'users.name as author_name',
        'users.profile_image as author_image',
      )
      .leftJoin('users', 'gallery_comments.user_id', 'users.id')
      .where('gallery_comments.item_id', id)
      .orderBy('gallery_comments.created_at', 'asc');
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
};

// Add a comment to a gallery item
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty.' });
    }

    const [comment] = await db('gallery_comments')
      .insert({ item_id: id, user_id: userId, content: content.trim() })
      .returning('*');

    const fullComment = await db('gallery_comments')
      .select(
        'gallery_comments.*',
        'users.username',
        'users.name as author_name',
        'users.profile_image as author_image',
      )
      .leftJoin('users', 'gallery_comments.user_id', 'users.id')
      .where('gallery_comments.id', comment.id)
      .first();

    res.status(201).json(fullComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
};

// Delete a comment (owner or admin)
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const comment = await db('gallery_comments').where({ id: commentId }).first();
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    if (comment.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await db('gallery_comments').where({ id: commentId }).del();
    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
};
