import adminController from '../controllers/admin-controller';
import authController from '../controllers/auth-controller';
import { isAuth, isRole, verifyRToken } from '../middlewares/auth-middleware';

import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'Api ready!' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh-token', verifyRToken, authController.refreshToken);
router.delete('/logout', verifyRToken, authController.logout);

router.get('/users', isAuth, isRole('ADMIN'), adminController.getUsers);
router.post('/user-role/:id', isAuth, isRole('ADMIN'), adminController.changeRole);

export default router;
