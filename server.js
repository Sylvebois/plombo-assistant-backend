import express from 'express';
import cors from 'cors';

import * as middleware from './utils/middleware.js';
import askToLLMRouter from './controllers/askToLLM.js';
import catalogsRouter from './controllers/catalogs.js';
import testQueryRouter from './controllers/testQuery.js';

const server = express();

server.use(cors());
server.use(express.json());
server.use(middleware.requestLogger);

server.use('/testQuery', testQueryRouter);
server.use('/askToLLM', askToLLMRouter);
server.use('/catalogs', catalogsRouter);

server.use(middleware.unknownEndpoint);
server.use(middleware.errorHandler);

export default server;