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
    topK: 10, // number of result to return
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
  });

  console.log(`Found ${queryResponse.matches.length} matches ...`);
  console.log(`Asking question: ${question} ...`);

  if (queryResponse.matches.length) {
    const llm = new LlamaCpp({ modelPath: process.env.MODEL_PATH });
    const chain = new loadQAStuffChain(llm);

    const docs = queryResponse.matches.map(match => {
      console.log(match.metadata.pageContent.length)
      return new Document({ ...match, pageContent: match.metadata.pageContent })
    });
    
    const result = await chain.call({ input_documents: docs, question: question })
    console.log(`Answer : ${result.text}`);
  }
  else {
    console.log('Since there are no match, ChatGPT will not be queried');
  }
};