import express from 'express';
import { DataSource } from 'typeorm';
import { SQL } from '../utils/config.js';
import { toChange, toRemove } from '../utils/keywords.js';
/*
const datasource = new DataSource({
  type: 'mssql',
  ...SQL,
  options: { trustServerCertificate: true }
});
*/

const transformer = rawString => {
  let modifiedString = rawString.toLowerCase().replace(/[<>_.;,'\/\\\-]/gmi, " ");

  for (const elem of toRemove) {
    modifiedString = modifiedString.replace(elem, '');
  }
  for (const [key, value] of Object.entries(toChange)) {
    modifiedString = modifiedString.replace(key, value);
  }

  return modifiedString.split(' ').filter(word => word.length > 2);
};

const testQueryRouter = express.Router();

testQueryRouter.post('/', async (req, resp, next) => {
  try {
    const query = req.body.query;
    if (query) {
      const keywords = transformer(query);
      const response = `SELECT * FROM test WHERE ${keywords
        .map(word => `(s_modele LIKE '%${word}%' OR s_id LIKE '%${word}%' OR ref_fou LIKE '%${word}%')`)
        .join(' AND ')
        }`;

      console.log(keywords);
      resp.status(200).json(response);
    }
    else {
      resp.status(200).json({ content: `Aucune question n'a été posée ...` });
    }
  }
  catch (err) {
    next(err);
  }
});

export default testQueryRouter;