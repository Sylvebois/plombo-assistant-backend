import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';
import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { loadQAStuffChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import fs from 'fs';

export const queryPineconeAndLLM = async (client, indexName, modelPath, questions) => {
  const fsWriteStream = fs.createWriteStream('responseTime.csv', { flags: 'a' });
  fsWriteStream.write('collectivecognition-v1.1-mistral-7b.Q4_K_M.gguf; langchain.js; sysPrompt, 4096 batchSize, 14 threads;');

  console.log(`Querying Pinecone vector store ...`);
  const llm = new LlamaCpp({
    modelPath: modelPath,
    embedding: true,
    useMmap: false,
    contextSize: 4096,
    batchSize: 4096,
    threads: 14,
    //verbose: true,
  });
  llm.generatePrompt([`You are Plombo, a French speaking, knowledgeable and helpful AI assistant who fulfills any request with detail and precision. You always use a polite language (an example is the use of the formal form of address instead of the informal one) and, if you do not know the anwser, you just say "Désolé, je ne trouve pas cette information, un de mes collègues pourrait peut-être vous aider ..."
  You are specialized in heating systems (radiators, boiler, floor heating ...), plumbing and sanitary products (baths, showers, toilets, bathroom meubels ...). 
  You are working for the company Sanidel and you have access to many catalogs and Excel listings to extend your knowledge.`]
  )

  const chain = new loadQAStuffChain(llm);

  for (const question of questions) {
    let start = Date.now();

    const index = client.Index(indexName);
    const queryEmbedding = await new HuggingFaceTransformersEmbeddings({
      modelName: 'Xenova/all-MiniLM-L6-v2',
    }).embedQuery(question);

    let queryResponse = await index.query({
      topK: 3, // number of result to return
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    });

    console.log(`Found ${queryResponse.matches.length} matches ...`);
    console.log(`Asking question: ${question} ...`);

    if (queryResponse.matches.length) {
      const docs = queryResponse.matches.map(match => {
        return new Document({ ...match, pageContent: match.metadata.pageContent })
      });

      const result = await chain.call({ input_documents: docs, question: question })
      console.log(`Answer : ${result.text}`);
    }
    else {
      console.log('Since there are no match, ChatGPT will not be queried');
    }
    let end = Date.now();
    fsWriteStream.write(`${end-start}ms;`);
  }
  fsWriteStream.write(`\n`);
  fsWriteStream.close();
};