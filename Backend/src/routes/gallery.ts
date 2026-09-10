import { Router } from 'express';
import { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem, toggleLike, toggleSave, getSavedItems, getComments, addComment, deleteComment } from '../controllers/galleryController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Public: get all gallery items
router.get('/', optionalAuth, getGalleryItems);

// Protected: upload new item
router.post('/', authenticate, createGalleryItem);

// Protected: update item (owner or admin)
router.put('/:id', authenticate, updateGalleryItem);

// Protected: delete item (owner or admin)
router.delete('/:id', authenticate, deleteGalleryItem);

// Protected: toggle like (60 per 5 min per IP)
router.post('/:id/like', authenticate, rateLimit(60, 5 * 60 * 1000), toggleLike);

// Protected: toggle save (bookmark) (60 per 5 min per IP)
router.post('/:id/save', authenticate, rateLimit(60, 5 * 60 * 1000), toggleSave);

// Protected: get user's saved items (for profile page)
router.get('/saved', authenticate, getSavedItems);

// Comments
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, rateLimit(20, 60 * 1000), addComment);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

export { router as galleryRoutes };
