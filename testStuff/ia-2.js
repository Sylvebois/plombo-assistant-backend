// 1. Import document loaders for different file formats
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from 'langchain/document_loaders/fs/csv';

// 2. Import OpenAI langugage model and other related modules
import { Pinecone } from '@pinecone-database/pinecone';
import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { VectorDBQAChain } from "langchain/chains";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// 3. Import dotenv for loading environment variables and fs for file system operations
import * as dotenv from 'dotenv';

// 4. Load Environment Variables
dotenv.config()

// 5. Load local files such as .json and .txt from ./docs
const loader = new DirectoryLoader("./docs", {
  '.csv': (path) => new CSVLoader(path, { 'delimiter': ';' }),
  ".txt": (path) => new TextLoader(path)
})

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY,
  environment: process.env.PINECONE_ENV
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

// 6. Define a function to normalize the content of the documents
const normalizeDocuments = (docs) => {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}

const VECTOR_STORE_PATH = "Documents.index";

// 7. Define the main function to run the entire process
export const run = async (params) => {
  const prompt = params[0]
  console.log('Prompt:', prompt)

  console.log("Loading docs...")
  const docs = await loader.load();

  console.log('Processing...')
  const model = new LlamaCpp({ modelPath: process.env.MODEL_PATH });
  const embedding = new HuggingFaceTransformersEmbeddings({ modelName: 'Xenova/all-MiniLM-L6-v2' });
  let vectorStore = await PineconeStore.fromExistingIndex(embedding, { pineconeIndex });

  console.log("Creating retrieval chain...")

  // 9. Query the retrieval chain with the specified question
  //const chain = VectorDBQAChain.fromLLM(model, vectorStore, { k: 1, returnSourceDocuments: true });
  const results = await vectorStore.similaritySearch(prompt, 1);
  console.log(results);
}

run(process.argv.slice(2))

//source: https://allenchun.medium.com/feed-local-data-to-llm-using-langchain-node-js-fd7ac44093e9
//source: https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/pinecone