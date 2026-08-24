import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, pool } from './src/config/db.js';
import { notFoundHandler, errorHandler } from './src/middlewares/errorHandler.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import slotRoutes from './src/routes/slotRoutes.js';
import queueRoutes from './src/routes/queueRoutes.js';
import procurementRoutes from './src/routes/procurementRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import farmerRoutes from './src/routes/farmerRoutes.js';

// 1. Load environment variables
dotenv.config();

// 2. Test PostgreSQL Database connection on startup
connectDB();

// 3. Initialize Express application
const app = express();

// 4. Global Middlewares
app.use(cors()); // Enable CORS for React/Vite frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// HTTP request logger in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 5. Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    portal: 'Kisan Procurement & Queue Management Portal API',
    version: '2.0.0',
    database: 'PostgreSQL',
    documentation: '/api/health',
  });
});

// 6. System Health Check Endpoint with PostgreSQL Connection Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'Disconnected';
  let dbName = null;

  try {
    const dbRes = await pool.query('SELECT current_database() as db_name, NOW() as server_time');
    dbStatus = 'Connected';
    dbName = dbRes.rows[0]?.db_name;
  } catch (err) {
    dbStatus = `Error: ${err.message}`;
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

// 7. Mount Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmer', farmerRoutes);

// 8. Centralized 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Kisan Procurement Backend API running in [${process.env.NODE_ENV || 'development'}] mode`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
