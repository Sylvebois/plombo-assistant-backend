import express from 'express';
import cors from 'cors';

import * as middleware from './utils/middleware.js';
import queryPineconeAndLLM from './askToAI.js';

const server = express();
server.use(cors());
server.use(middleware.requestLogger);

server.post('/askLLM', async (req, resp, next) => {
  try {
    const response = await queryPineconeAndLLM(`Bonjour, comment t'appelles-tu ?`);
    resp.status(200).json(response);
  }
  catch (err) {
    next(err);
  }
});

server.use(middleware.unknownEndpoint);
server.use(middleware.errorHandler);

export default server;