import express from 'express';
import queryPineconeAndLLM from '../models/askToLLM.js';

const askToLLMRouter = express.Router();

askToLLMRouter.post('/', async (req, resp, next) => {
  try {
    const query = req.body.query;
    if (query) {
      const response = await queryPineconeAndLLM(query);
      resp.status(200).json(response);
    }
    else {
      resp.status(200).json({ content: `Aucune question n'a été posée ...` });
    }
  }
  catch (err) {
    next(err);
  }
});

export default askToLLMRouter;