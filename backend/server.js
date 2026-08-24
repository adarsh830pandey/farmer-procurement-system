import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import { notFoundHandler, errorHandler } from './src/middlewares/errorHandler.js';

// 1. Load environment variables from .env file
dotenv.config();

// 2. Connect to MongoDB database
connectDB();

// 3. Initialize Express application
const app = express();

// 4. Middlewares
app.use(cors()); // Allow cross-origin requests from frontend
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// HTTP request logger in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 5. Basic Route / Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Farmer Digital Procurement & Queue Management API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 6. System Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    status: 'OK',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[mongoose.connection.readyState] || 'Unknown',
      readyState: mongoose.connection.readyState,
    },
  });
});

// 7. Error Handling Middlewares (Must be registered after routes)
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`Server is running in [${process.env.NODE_ENV || 'development'}] mode`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});
