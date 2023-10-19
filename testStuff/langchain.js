import { Pinecone } from '@pinecone-database/pinecone';
import { PINECONE, MODELPATH } from './utils/config.js';
import { queryPineconeAndLLM } from './queryPineconeAndLLM.js';

const questions = [
  `Bonjour, comment t'appelles-tu ?`,
  `Que peux-tu me dire sur la société Sanidel ?`,
  `Qu'est-ce que le thermosiphon ?`,
  //`Quel est le prix de vente recommandé (recommended retail price) pour un Abattant Blanc Brillant Mat Starck ?`
]

const pineconeClient = new Pinecone({ apiKey: PINECONE.key, environment: PINECONE.env });

(async () => {
  await queryPineconeAndLLM(pineconeClient, PINECONE.index, MODELPATH, questions);
})();

// info found here : https://youtu.be/CF5buEVrYwo?si=GxTb2uzDbYADBiw4
// Beware of the compiled version of llama-cpp (disable AVX instructions and enable SSSE3 for my current old server ...)
