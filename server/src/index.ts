import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const startServer = async () => {
  const { default: app } = await import('./app');

  const server = http.createServer(app);

  const {
    MONGO_DATABASE_CONNECT_STRING,
    PORT
  } = process.env;

  if (!MONGO_DATABASE_CONNECT_STRING) {
    throw new Error('Missing MongoDB connection string.');
  }

  try {
    await mongoose.connect(MONGO_DATABASE_CONNECT_STRING);

    console.log('MongoDB connected');

    server.listen(PORT || 8080, () => {
      console.log(`Server connected on PORT:${PORT || 8080}`);
    });
  } catch (error) {
    console.log('MongoDB connection failed', error);
    process.exit(1);
  }
};

startServer();