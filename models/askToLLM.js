import { Pinecone } from '@pinecone-database/pinecone';
import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';
import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { PromptTemplate } from "langchain/prompts";
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';

import { PINECONE, MODELPATH } from '../utils/config.js';

const pineconeClient = new Pinecone({ apiKey: PINECONE.key, environment: PINECONE.env });

const llm = new LlamaCpp({
  modelPath: MODELPATH,
  embedding: true,
  useMmap: false,
  contextSize: 4096,
  batchSize: 4096,
  threads: 14,
  //verbose: true,
});

llm.generatePrompt([
  `Tu es Plombo, un assistant IA francophone, compétent et serviable qui répond à toutes les demandes avec précision et minutie. Tu utilises toujours un langage poli (par exemple en utilisant le vouvoiemnt au lieu du tutoiement) et, si tu ne connais pas la réponse, tu dis simplement "Désolé, je ne trouve pas cette information, un de mes collègues pourrait peut-être vous aider ...".
Tu es spécialisé dans les systèmes de chauffage (radiateurs, chaudière, chauffage par le sol ...), la plomberie et les produits sanitaires (baignoires, douches, toilettes, meubles de salle de bains ...). 
Tu travailles pour la société Sanidel et tu as accès à de nombreux catalogues et listes Excel pour approfondir tes connaissances.`,
  `L'utilisateur est un client qui utilise Plombo pour recevoir des informations (prix, dimensions, puissance et autres données techniques ...) sur une grande variété de produits (systèmes de chauffage, plomberie, salle de bains, toilettes, robinets, éviers ...).`
]);
/*const basePrompt = PromptTemplate.fromTemplate(
  `You are Plombo, a French speaking, knowledgeable and helpful AI assistant who fulfills any request with detail and precision. You always use a polite language (an example is the use of the formal form of address instead of the informal one) and, if you do not know the anwser, you just say "Désolé, je ne trouve pas cette information, un de mes collègues pourrait peut-être vous aider ..."
  You are specialized in heating systems (radiators, boiler, floor heating ...), plumbing and sanitary products (baths, showers, toilets, bathroom meubels ...). 
  You are working for the company Sanidel and you have access to many catalogs and Excel listings to extend your knowledge.
  
  The user is a customer who uses Plombo to recieve informations (price, dimensions, power and other technical data ...) about a large variety of products (heating systems, plumbing, bathroom, toilet, faucet, sink ...).`
);*/

const chain = new loadQAStuffChain(llm, { verbose: true });

const queryPineconeAndLLM = async (query) => {
  let start = Date.now();

  const index = pineconeClient.Index(PINECONE.index);

  const queryEmbedding = await new HuggingFaceTransformersEmbeddings({
    modelName: 'Xenova/all-MiniLM-L6-v2'
  }).embedQuery(query);

  let queryResponse = await index.query({
    topK: 3, // number of result to return
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });
console.log(queryResponse)
  console.log(`Found ${queryResponse.matches.length} matches ...`);
  console.log(`Asking question: ${query} ...`);

  const sources = [];

  queryResponse.matches.forEach(match => {
    let docName = match.metadata.txtPath.split(/\/|\\/g).pop();
    if (!sources.includes(docName)) { sources.push(docName); }
  });

  if (queryResponse.matches.length) {
    const docs = queryResponse.matches.map(match => {
      return new Document({ ...match, pageContent: match.metadata.pageContent })
    });

    const result = await chain.call({ input_documents: docs, question: query })
    console.log(`Answer : ${result.text}`);
    return ({ content: result.text, sources, responseTime: Date.now() - start })
  }
  else {
    console.log('Since there are no match, ChatGPT will not be queried');
    return ({ content: '', sources, responseTime: Date.now() - start })
  }
}

export default queryPineconeAndLLM;