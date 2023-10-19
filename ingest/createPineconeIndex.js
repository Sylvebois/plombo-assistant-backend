export const createPineconeIndex = async (client, indexName, vectorDim) => {
  console.log(`Checking "${indexName}" ...`);
  const existingIndexes = await client.listIndexes();

  if (existingIndexes.findIndex(elem => elem.name === indexName) === -1) {
    console.log(`Creating ${indexName} ...`);

    const createClient = await client.createIndex({
      name: indexName,
      dimension: vectorDim,
      metric: 'cosine'
    });

    console.log(`Created with client : `, createClient);
  }
  else {
    console.log(`${indexName} already exists.`);
  }
};