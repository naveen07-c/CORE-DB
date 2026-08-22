import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import catalogRoutes from './catalog.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';

const router = Router();

// 1. Healthcheck & DBMS status endpoint (Public)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: 'VORTEX Enterprise DBMS',
    schemaVersion: '1.0.0',
    tables: 11,
    acidCheckout: 'ENABLED',
    snapshotImmutability: 'ACTIVE',
    timestamp: new Date().toISOString(),
  });
});

// 2. Mount subrouters matching REST API specification in Section 3.3
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/cart', cartRoutes);
router.use('/', catalogRoutes);
router.use('/', orderRoutes);

export default router;
