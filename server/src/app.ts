import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { authRouter, meRouter } from '@/containers';
import globalErrorHandler from './controllers/errorController';

const app: Express = express();

app.use(cors({
  origin: 'http://localhost:5137',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/v1/auth', authRouter.router);
app.use('/api/v1/me', meRouter.router);

app.use(globalErrorHandler);

export default app;