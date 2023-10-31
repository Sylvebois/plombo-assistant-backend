import { MODELPATH } from '../utils/config.js';
import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { PromptTemplate } from 'langchain/prompts';
import { ConversationChain } from 'langchain/chains';
import { BufferWindowMemory, ConversationSummaryMemory, CombinedMemory } from 'langchain/memory';
import fs from 'fs';

const conversation = async (modelPath) => {
  const fsWriteStream = fs.createWriteStream('testStuff/responseTime.csv', { flags: 'a' });
  fsWriteStream.write('vigogne-2-7b-instruct.Q4_K_M.gguf; convesation_with_memory.js; promptTemplate, 4096 batchSize, 14 threads;');

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

  const TEMPLATE = `You are Plombo, a French speaking, knowledgeable and helpful AI assistant who fulfills any request with detail and precision. You always use a polite language (an example is the use of the formal form of address instead of the informal one).
  You are specialized in heating systems (radiators, boiler, floor heating ...), plumbing and sanitary products (baths, showers, toilets, bathroom meubels ...). 
  You are working for the company Sanidel.

  Use the following pieces of context to answer the question at the end. If you don't know the answer, say: "Sorry I did not find the info in my database but there's a possible answer:" and try to make up an answer.
  
  Summary of conversation:
  {convSummary}
  Current conversation:
  {lastLines}
  Human:{input}
  AI:`
  //and, if you do not know the anwser, you just say "Désolé, je ne trouve pas cette information, un de mes collègues pourrait peut-être vous aider ..."
  const convMemory = new BufferWindowMemory({ memoryKey: 'lastLines', inputKey: 'input', k: 1 })
  const summaryMemory = new ConversationSummaryMemory({ llm, memoryKey: 'convSummary', inputKey: 'input' })
  const memory = new CombinedMemory({ memories: [convMemory, summaryMemory] })

  const prompt = new PromptTemplate({
    inputVariables: ['input', 'lastLines', 'convSummary'],
    template: TEMPLATE
  })

  const convChain = new ConversationChain({ llm, prompt, memory, verbose: true })

  const questions = [
    `Bonjour, comment t'appelles-tu ?`,
    `Que peux-tu me dire sur la société Sanidel ?`,
    `Qu'est-ce que le thermosiphon ?`,
    `Quel est le prix de vente d'un bain en acier de 180x80cm ?`
  ]

  for (const question of questions) {
    const start = Date.now();
    const response = await convChain.call({ input: question })
    console.log(response)
    const end = Date.now();
    fsWriteStream.write(`${end - start}ms;`);
  }
  fsWriteStream.write(`\n`);
  fsWriteStream.close();
}

conversation(MODELPATH)