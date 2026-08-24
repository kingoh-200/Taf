import { Router } from 'express';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected routes (admin only)
router.post('/', authenticate, authorize('admin'), createAnnouncement);
router.put('/:id', authenticate, authorize('admin'), updateAnnouncement);
router.delete('/:id', authenticate, authorize('admin'), deleteAnnouncement);

export { router as announcementRoutes };
