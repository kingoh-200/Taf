import { Router } from 'express';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, toggleLike, toggleSave, getSavedItems, getComments, addComment, deleteComment } from '../controllers/galleryController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public: get all gallery items
router.get('/', optionalAuth, getGalleryItems);

// Protected: upload new item
router.post('/', authenticate, createGalleryItem);

// Protected: delete item (owner or admin)
router.delete('/:id', authenticate, deleteGalleryItem);

// Protected: toggle like
router.post('/:id/like', authenticate, toggleLike);

// Protected: toggle save (bookmark)
router.post('/:id/save', authenticate, toggleSave);

// Protected: get user's saved items (for profile page)
router.get('/saved', authenticate, getSavedItems);

// Comments
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, addComment);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

export { router as galleryRoutes };
