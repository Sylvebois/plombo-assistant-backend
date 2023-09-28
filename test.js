import { LlamaCpp } from 'langchain/llms/llama_cpp';
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

import * as dotenv from 'dotenv';
dotenv.config();

// We can construct an LLMChain from a PromptTemplate and an LLM.
const model = new LlamaCpp({ modelPath: process.env.MODEL_PATH });
const prompt = PromptTemplate.fromTemplate(
  "What is a good name for a company that makes {product}?"
);
const chainA = new LLMChain({ llm: model, prompt });

// The result is an object with a `text` property.
const resA = await chainA.call({ product: "colorful socks" });
console.log({ resA });