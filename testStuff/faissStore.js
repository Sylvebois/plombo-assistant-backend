import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { loadQAStuffChain, RetrievalQAChain } from 'langchain/chains';
import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { MODELPATH } from '../utils/config.js';

const embeddings = await new HuggingFaceTransformersEmbeddings({ modelName: 'Xenova/all-MiniLM-L6-v2' });

const createStore = async () => {
  console.log('Getting the docs ...');
  const loader = new DirectoryLoader('./ingest/docs', {
    '.txt': (path) => new TextLoader(path),
    '.csv': (path) => new CSVLoader(path, { 'delimiter': ';' })
  });
  const docs = await loader.load();

  console.log(`Splitting ${docs.length} into chuncks ...`);
  const textSplitter = new RecursiveCharacterTextSplitter({ chunckSize: 200, chunckOverlap: 50 });
  const documents = await textSplitter.splitDocuments(docs);

  console.log(`creating vectorStore from ${documents.length} chuncks ...`);
  const vectorStore = await FaissStore.fromDocuments(documents, embeddings);
  await vectorStore.save('./vectorStore');
}

const searchStore = async () => {
  const llm = new LlamaCpp({
    modelPath: MODELPATH,
    embedding: true,
    useMmap: false,
    contextSize: 4096,
    batchSize: 4096,
    threads: 14,
  });

  const vectorStore = await FaissStore.load('./vectorStore', embeddings);

  const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(llm), // Add prompt and verbose here
    retriever: vectorStore.asRetriever(1),        // Can also add verbose here
    returnSourceDocuments: true
  })

  const questions = [
    `Bonjour, comment t'appelles-tu ?`,
    `Que peux-tu me dire sur la société Sanidel ?`,
    `Qu'est-ce que le thermosiphon ?`,
    `Quel est le prix de vente d'un bain en acier de 180x80cm ?`
  ]

  for (const question of questions) {
    console.log(question);
    const start = Date.now();
    const response = await chain.call({ query: question });
    console.log(response);
    const end = Date.now();
    console.log(`response in ${end - start}ms;`);
  }
}

//createStore();
searchStore();