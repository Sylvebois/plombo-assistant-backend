import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 3300;

const PINECONE = { 
  index: process.env.PINECONE_INDEX,
  env: process.env.PINECONE_ENV,
  key: process.env.PINECONE_KEY
};

const SQL = {
  host: process.env.SQL_HOST,
  port: process.env.SQL_PORT,
  database: process.env.SQL_DB,
  username: process.env.SQL_USER,
  password: process.env.SQL_PASS
}

const MODELPATH = process.env.MODEL_PATH;

export { PORT, PINECONE, SQL, MODELPATH };