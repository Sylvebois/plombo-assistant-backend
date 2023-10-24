import express from 'express';
import cors from 'cors';

import * as middleware from './utils/middleware.js';
import queryPineconeAndLLM from './askToAI.js';

const server = express();
server.use(cors());
server.use(express.json());
server.use(middleware.requestLogger);

server.post('/askLLM', async (req, resp, next) => {
  try {
    const query = req.body.query;
    if(query) {
      const response = await queryPineconeAndLLM(query);
      resp.status(200).json(response);
    }
    else {
      resp.status(200).json({content: `Aucune question n'a été posée ...`});
    }
  }
  catch (err) {
    next(err);
  }
});

server.use(middleware.unknownEndpoint);
server.use(middleware.errorHandler);

export default server;