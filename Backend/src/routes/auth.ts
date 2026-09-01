import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Rate limit: 10 attempts per 15 minutes per IP
router.post('/register', rateLimit(10, 15 * 60 * 1000), register);
router.post('/login', rateLimit(10, 15 * 60 * 1000), login);

export { router as authRoutes };
