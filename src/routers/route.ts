import { isAuth, isRole, verifyRToken } from '../middlewares/auth-middleware';

import { login, refreshToken, logout } from '../controllers/auth-controller';
import { getUsers, updateUser, registerUser } from '../controllers/admin-controller';
import { createOrder, deleteOrder, getOrders, updateOrderStatus } from '../controllers/production-controller';
import { createQC, exportQCReport } from '../controllers/qc-controller';
import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'Api ready!' });
});

router.post('/login', login);
router.get('/refresh-token', verifyRToken, refreshToken);
router.delete('/logout', verifyRToken, logout);

router.post('/register', isAuth, isRole('ADMIN'), registerUser);
router.get('/users', isAuth, isRole('ADMIN'), getUsers);
router.put('/user/:id', isAuth, isRole('ADMIN'), updateUser);

router.get('/production-orders', isAuth, isRole('OPERATOR', 'QC'), getOrders);
router.post('/production-order', isAuth, isRole('OPERATOR'), createOrder);
router.put('/production-order/:referenceNo', isAuth, isRole('OPERATOR'), updateOrderStatus);
router.delete('/production-order/:referenceNo', isAuth, isRole('OPERATOR'), deleteOrder);

router.post('/qc-report/:productionId', isAuth, isRole('QC'), createQC);
router.get('/qc-report/:referenceNo', isAuth, isRole('QC'), exportQCReport);

export default router;
