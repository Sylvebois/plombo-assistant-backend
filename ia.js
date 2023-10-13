import { LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp';
import { config } from 'dotenv';

config();

const model = new LlamaModel({ modelPath: process.env.MODEL_PATH });
const context = new LlamaContext({ model, threads: 14 });
const session = new LlamaChatSession({ context });

const q1 = 'Bonjour, comment vas-tu?';
console.log('User: ' + q1);

let start = Date.now();
const a1 = await session.prompt(q1);
console.log('AI: ' + a1);
let end = Date.now();

console.log(`Première réponse en ${end-start}ms`)

const q2 = 'Summerize what you said';
console.log('User: ' + q2);

start = Date.now();
const a2 = await session.prompt(q2);
console.log('AI: ' + a2);
end = Date.now();

console.log(`Seconde réponse en ${end-start}ms`)