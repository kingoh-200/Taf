import { Router } from 'express';
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllMembers);
router.get('/:id', getMemberById);

// Protected routes (admin only)
router.post('/', authenticate, authorize('admin'), createMember);
router.put('/:id', authenticate, authorize('admin'), updateMember);
router.delete('/:id', authenticate, authorize('admin'), deleteMember);

export { router as memberRoutes };
