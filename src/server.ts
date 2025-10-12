import express from 'express';
import router from './routers/route';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

app.use(morgan('dev'));

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

export default app;
