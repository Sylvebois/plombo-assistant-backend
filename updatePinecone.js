import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const updatePinecone = async (client, indexName, documents) => {
  console.log('Retrieving Pinecone index');

  const index = client.Index(indexName);

  console.log(`Pinecone index retrieved : ${indexName}`);

  for (const doc of documents) {
    console.log(`Processing document: ${doc.metadata.source}`);

    const txtPath = doc.metadata.source;
    const fileName = txtPath.split(/\/|\\/g).pop();
    const text = doc.pageContent;
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });

    console.log('Splitting text into chuncks ...');

    const chuncks = await textSplitter.createDocuments([text]);

    console.log(`Text splitted into ${chuncks.length} chunks`);
    console.log(`Calling Hugging Face's embedding endpoint with ${chuncks.length} text chunks ...`);

    const embeddingsArrays = await new HuggingFaceTransformersEmbeddings({
      modelName: 'Xenova/all-MiniLM-L6-v2'
    })
      .embedDocuments(chuncks.map(chunck => chunck.pageContent.replace(/\n/g, " ")));

    console.log(`Finished embbeding documents`);
    console.log(`Creating ${chuncks.length} vectors array with id, value and metadata ...`);

    const batchSize = 100;  // Recommended by Pinecone --> Depends on database
    let batch = [];

    for (let idx = 0; idx < chuncks.length; idx++) {
      const chunck = chuncks[idx];
      const vector = {
        id: `${fileName}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunck.metadata,
          loc: JSON.stringify(chunck.metadata.loc),
          pageContent: chunck.pageContent,
          txtPath: txtPath
        }
      };

      batch.push(vector);

      if (batch.length === batchSize || idx === chuncks.length - 1) {
        console.log(batch)
        await index.upsert(batch);
        batch = [];
      }
    }
    console.log(`Pinecone index updated with ${chuncks.length} vectors`);
  }
};