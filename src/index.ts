import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import substitutesRouter from './api/substitutes';
import schedulesRouter from './api/schedules';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/api/substitutes', substitutesRouter);
app.use('/api/schedules', schedulesRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
