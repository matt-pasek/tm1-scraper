import express from 'express';
import { getSubstitutions } from '../service/substitutes';

const substitutesRouter = express.Router();

substitutesRouter.get('/', (req, res) => {
  getSubstitutions().then((substitutions) => {
    res.json({ substitutions });
  });
});

export default substitutesRouter;
