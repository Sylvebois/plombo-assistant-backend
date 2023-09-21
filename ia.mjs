import { ModelType } from "@llama-node/core";
import { LLM } from "llama-node";
import { LLMRS } from "llama-node/dist/llm/llm-rs.cjs";
import path from "path";



const modelPath = path.resolve(process.cwd(), "./llm/models/llama2.7b.vigogne2.ggml_v3.q4_K_M.bin");
const modelType = ModelType.Llama
const prmpt = 'Hello'
const llama = new LLM(LLMRS);

const toChatTemplate = (prompt) =>
  `### Instruction:  
    ${prompt}  
    ### Response:`;

const run = async () => {
  const params = {
    prompt: toChatTemplate(prmpt),
    numPredict: 128,
    temperature: 0.8,
    topP: 1,
    topK: 40,
    repeatPenalty: 1,
    repeatLastN: 64,
    seed: 0,
    feedPrompt: true,
  };

  await llama.load({ modelPath, modelType });
  await llama.createCompletion(params, (response) => {
    process.stdout.write(response.token);
  });
};
run();