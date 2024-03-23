import express from 'express';
import { getSubstitutions } from '../service/substitutes';

const substitutesRouter = express.Router();

substitutesRouter.get('/', (req, res) => {
  getSubstitutions().then((r) => console.log(r));
});

export default substitutesRouter;
