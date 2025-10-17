import { isAuth, isRole, verifyRToken } from '../middlewares/auth-middleware';

import { login, refreshToken, logout } from '../controllers/auth-controller';
import { getUsers, updateUser, registerUser } from '../controllers/admin-controller';
import { createOrder, deleteOrder, getOrderDetails, getOrders, updateOrderStatus } from '../controllers/production-controller';
import { createQC, exportQCReport } from '../controllers/qc-controller';
import { Router } from 'express';
import { getQcInspection, getTotalProduct, getTotalUser } from '../controllers/dashboard-controller';

const router = Router();

router.get('/', (_req, res) => {
  const isProduction = process.env.IS_PRODUCTION === 'true';
  res.status(200).json({
    success: true,
    message: 'Api ready!',
    prod: isProduction,
  });
});

router.post('/login', login);
router.get('/refresh-token', verifyRToken, refreshToken);
router.delete('/logout', verifyRToken, logout);

router.post('/register', isAuth, isRole('ADMIN'), registerUser);
router.get('/users', isAuth, isRole('ADMIN'), getUsers);
router.put('/user/:id', isAuth, isRole('ADMIN'), updateUser);

router.get('/production-orders', isAuth, getOrders);
router.get('/production-order/:referenceNo', isAuth, getOrderDetails);

router.post('/production-order', isAuth, isRole('OPERATOR'), createOrder);
router.put('/production-order/:referenceNo', isAuth, isRole('OPERATOR'), updateOrderStatus);
router.delete('/production-order/:referenceNo', isAuth, isRole('OPERATOR'), deleteOrder);

router.post('/qc-report/:productionId', isAuth, isRole('QC'), createQC);
router.get('/qc-report/:referenceNo', isAuth, isRole('QC'), exportQCReport);

router.get('/dashboard/product', isAuth, getTotalProduct);
router.get('/dashboard/qc', isAuth, getQcInspection);
router.get('/dashboard/user', isAuth, isRole('ADMIN'), getTotalUser);

export default router;
