import express, { type Express } from 'express';
import cors from 'cors';

const app: Express = express();

app.use(cors({
  origin: 'http://localhost:5137',
  credentials: true
}));

export default app;