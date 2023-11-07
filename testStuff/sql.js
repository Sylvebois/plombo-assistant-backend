import { DataSource } from 'typeorm';
import { SqlDatabase } from 'langchain/sql_db';
import { PromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { LlamaCpp } from 'langchain/llms/llama_cpp';

import { MODELPATH, SQL } from '../utils/config.js';

const datasource = new DataSource({
  type: 'mssql',
  ...SQL,
  options: { trustServerCertificate: true }
});

const db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource });
const llm = new LlamaCpp({
  modelPath: MODELPATH,
  embedding: true,
  useMmap: false,
  contextSize: 10000,
  batchSize: 10000,
  threads: 14,
  verbose: true
});

/**
 * Create the first prompt template used for getting the SQL query.
 */
const prompt = PromptTemplate.fromTemplate(
  `Based on the provided SQL table schema below, write a SQL query that would answer the user's question.
------------
SCHEMA: {schema}
------------
QUESTION: {question}
------------
SQL QUERY:`
);

/**
 * Create a new RunnableSequence where we pipe the output from `db.getTableInfo()`
 * and the users question, into the prompt template, and then into the llm.
 * We're also applying a stop condition to the llm, so that it stops when it
 * sees the `\nSQLResult:` token.
 */
const sqlQueryChain = RunnableSequence.from([
  {
    schema: async () => db.getTableInfo(),
    question: (input) => input.question,
  },
  prompt,
  llm.bind({ stop: ["\nSQLResult:"] }),
  new StringOutputParser(),
]);

const res = await sqlQueryChain.invoke({ question: "Quel est le prix de l'article 284130 ?" });
console.log({ res });