import authController from '../controllers/auth-controller';
import { verifyRToken } from '../middlewares/auth-middleware';

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Api ready!' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh-token', verifyRToken, authController.refreshToken);
router.delete('/logout', verifyRToken, authController.logout);

export default router;
