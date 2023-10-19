import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 3003;

const PINECONE = { 
  index: process.env.PINECONE_INDEX,
  env: process.env.PINECONE_ENV,
  key: process.env.PINECONE_KEY
};

const MODELPATH = process.env.MODEL_PATH;

export { PORT, PINECONE, MODELPATH };