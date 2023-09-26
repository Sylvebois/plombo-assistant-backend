import { fileURLToPath } from 'url';
import path from 'path';

import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';
import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { loadQAStuffChain } from "langchain/chains";
import { Document } from 'langchain/document';

export const queryPineconeAndLLM = async (client, indexName, question) => {
  console.log(`Querying Pinecone vector store ...`);

  const index = client.Index(indexName);
  const queryEmbedding = await new HuggingFaceTransformersEmbeddings({
    modelName: 'Xenova/all-MiniLM-L6-v2'
  }).embedQuery(question);

  let queryResponse = await index.query({
    queryResquest: {
      topK: 10, // number of result to return
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true
    }
  });

  console.log(`Found ${queryResponse.matches.length} matches ...`);
  console.log(`Asking question: ${question} ...`);

  if (queryResponse.matches.length) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const modelPath = path.join(__dirname, 'llm', 'models', 'vigogne-2-7b-instruct.Q4_K_M.gguf');
    
    const llm = new LlamaCpp({ modelPath: modelPath });
    const chain = new loadQAStuffChain(llm);

    const concatenatedPageContent = queryResponse.matches
      .map(match => match.metadata.pageContent)
      .join(' ');

    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question: question
    })

    console.log(`Answer : ${result.text}`);
  }
  else {
    console.log('Since there are no match, ChatGPT will not be queried');
  }
};