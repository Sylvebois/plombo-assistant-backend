import { Pinecone } from '@pinecone-database/pinecone';
import { PINECONE, MODELPATH } from '../utils/config.js';
import { queryPineconeAndLLM } from './queryPineconeAndLLM.js';

const questions = [
  `Bonjour, comment t'appelles-tu ?`,
  `Que peux-tu me dire sur la société Sanidel ?`,
  `Qu'est-ce que le thermosiphon ?`,
  `Quel est le prix de vente d'un bain en acier de 180x80cm ?`
]

const pineconeClient = new Pinecone({ apiKey: PINECONE.key, environment: PINECONE.env });

(async () => {
  await queryPineconeAndLLM(pineconeClient, PINECONE.index, MODELPATH, questions);
})();
