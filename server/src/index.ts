import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import app from './app';

const server = http.createServer(app);

const {
  MONGO_DATABASE_CONNECT_STRING,
  PORT
} = process.env;
console.log(MONGO_DATABASE_CONNECT_STRING, PORT)

mongoose.connect(MONGO_DATABASE_CONNECT_STRING!)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT || 8080, () => {
      console.log(`Server connected on PORT:${PORT || 8080}`);
    });
  })
  .catch((error) => {
    console.log('MongoDB connection failed', error);
  });