import authController from '../controllers/auth-controller';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Api ready!' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
