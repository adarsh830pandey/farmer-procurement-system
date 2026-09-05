import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, pool } from './src/config/db.js';
import { notFoundHandler, errorHandler } from './src/middlewares/errorHandler.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import farmerRoutes from './src/routes/farmerRoutes.js';
import buyerRoutes from './src/routes/buyerRoutes.js';
import procurementRoutes from './src/routes/procurementRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import slotRoutes from './src/routes/slotRoutes.js';
import queueRoutes from './src/routes/queueRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

// 1. Load environment variables
dotenv.config();

// 2. Initialize Express application
const app = express();

// 3. Global Middlewares
app.use(cors()); // Enable CORS for React frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// HTTP request logger in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Farmer Procurement Management System API (SIH)',
    version: '2.0.0',
    database: 'PostgreSQL',
    documentation: '/api/health',
  });
});

// 5. System Health Check Endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'Disconnected';
  let dbName = null;

  try {
    const dbRes = await pool.query('SELECT current_database() as db_name, NOW() as server_time');
    dbStatus = 'Connected';
    dbName = dbRes.rows[0]?.db_name;
  } catch (err) {
    dbStatus = `Notice: ${err.message}`;
  }

  res.status(200).json({
    status: 'OK',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      engine: 'PostgreSQL',
      status: dbStatus,
      databaseName: dbName,
    },
  });
});

// 6. Mount Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/farmer', farmerRoutes); // backward compatibility
app.use('/api/buyers', buyerRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);

// 7. Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Start Server
const PORT = process.env.PORT || 5000;

// Connect to DB and listen
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Farmer Procurement Backend running on http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
});

export default app;
