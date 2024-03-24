import express from 'express';
import { getSchedules } from '../service/schedules';

const schedulesRouter = express.Router();

schedulesRouter.get('/', (req, res) => {
  getSchedules().then((schedules) => {
    res.json({ schedules });
  });
});

export default schedulesRouter;
