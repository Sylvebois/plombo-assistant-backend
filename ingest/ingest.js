import { Pinecone } from '@pinecone-database/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';

import { createPineconeIndex } from './createPineconeIndex.js';
import { updatePinecone } from './updatePinecone.js';
import { PINECONE } from '../utils/config.js';

const loader = new DirectoryLoader('../docs', {
  '.txt': (path) => new TextLoader(path),
  '.csv': (path) => new CSVLoader(path, { 'delimiter': ';' })
});
const docs = await loader.load();

const pineconeClient = new Pinecone({
  apiKey: PINECONE.key,
  environment: PINECONE.env
});

const vectorDimension = 384;     // Depends of the embedder (1536 for OpenAI, 384 for HuggingFace) ???

(async () => {
  await createPineconeIndex(pineconeClient, PINECONE.index, vectorDimension);
  await updatePinecone(pineconeClient, PINECONE.index, docs);
})();