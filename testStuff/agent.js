import { Pinecone } from '@pinecone-database/pinecone';
import { PINECONE, MODELPATH } from '../utils/config.js';
import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { AgentExecutor, initializeAgentExecutorWithOptions } from "langchain/agents";
import { VectorStoreQATool } from "langchain/tools";
import { Calculator } from 'langchain/tools/calculator';
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";

process.env.LANGCHAIN_HANDLER = 'langchain';

const pineconeClient = new Pinecone({ apiKey: PINECONE.key, environment: PINECONE.env });

const llm = new LlamaCpp({
  modelPath: MODELPATH,
  embedding: true,
  useMmap: false,
  contextSize: 4096,
  batchSize: 4096,
  threads: 14,
});

const tools = [new Calculator(), new VectorStoreQATool('sanidel-docs','store containing sanidel history and main products',{
  vectorStore: pineconeClient,
  llm
})];

const agent = await initializeAgentExecutorWithOptions(tools, llm, {
  agentType: "structured-chat-zero-shot-react-description",
  verbose: true
})

const questions = [
  `Bonjour, comment t'appelles-tu ?`,
  `Que peux-tu me dire sur la société Sanidel ?`,
  `Qu'est-ce que le thermosiphon ?`,
  `Quel est le prix de vente d'un bain en acier de 180x80cm ?`
]

for (const question of questions) {
  const start = Date.now();
  console.log(await agent.call({ input: question }))
  const end = Date.now();
  console.log(`${end - start}ms;`)
}
