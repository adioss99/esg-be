import express from 'express';
import router from './routers/route';
import morgan from 'morgan';
import cors from 'cors';
import cookieparser from 'cookie-parser';

const app = express();

app.use(morgan('dev'));

app.use(cookieparser());
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000', 'https://esg-fe.vercel.app/'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

export default app;
