import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if database is offline
    });
    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Warning] ${error.message}`);
    console.warn(`Tip: If you're running locally, ensure MongoDB service is started (or add your MongoDB Atlas URI in .env).`);
  }
};

export default connectDB;
