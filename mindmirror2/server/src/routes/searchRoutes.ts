import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { searchController } from '../controllers/searchController';

const router = Router();

router.get('/', requireAuth, searchController.search);

export default router;
