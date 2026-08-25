import { Router } from 'express';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, toggleLike, toggleSave, getSavedItems } from '../controllers/galleryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public: get all gallery items
router.get('/', getGalleryItems);

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

export { router as galleryRoutes };
