import { Router } from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', updatePassword);

export { router as profileRoutes };
