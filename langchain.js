import { Pinecone } from '@pinecone-database/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import * as dotenv from 'dotenv';

import { createPineconeIndex } from './createPineconeIndex.js';
import { updatePinecone } from './updatePinecone.js';
import { queryPineconeAndLLM } from './queryPineconeAndLLM.js';

dotenv.config();

const loader = new DirectoryLoader('./docs', {
  '.txt': (path) => new TextLoader(path),
  '.csv': (path) => new CSVLoader(path, { 'delimiter': ';' })
});
const docs = await loader.load();

const question = 'Quel est le prix de vente recommandé (recommended retail price) pour un Abattant Blanc Brillant Mat Starck ?';
const indexName = process.env.PINECONE_INDEX;
const vectorDimension = 384;     // Depends of the embedder (1536 for OpenAI, 384 for HuggingFace) ???

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY,
  environment: process.env.PINECONE_ENV
});

(async () => {
 // await createPineconeIndex(pinecone, indexName, vectorDimension);
 // await updatePinecone(pinecone, indexName, docs);
  await queryPineconeAndLLM(pinecone, indexName, question);
})();

// info found here : https://youtu.be/CF5buEVrYwo?si=GxTb2uzDbYADBiw4