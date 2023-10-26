import fs from 'fs';
import express from 'express';
import { URL } from 'url';

const BASEDIR = new URL('..', import.meta.url).pathname;

const catalogsRouter = express.Router();

catalogsRouter.get('/list', async (req, resp, next) => {
  try {
    const list = fs.readdirSync(`${BASEDIR}/catalogs`);
    resp.status(200).json(list);
  }
  catch (err) {
    next(err);
  }
})

catalogsRouter.get('/:name', async (req, resp, next) => {
  try {
    const fileName = req.params.name
    const list = fs.readdirSync(`${BASEDIR}/catalogs`);

    if (list.includes(fileName)) {
      resp.sendFile(`${BASEDIR}/catalogs/${fileName}`);
    }
    else {
      resp.status(404).json({ error: 'file not found' });
    }
  }
  catch (err) {
    next(err);
  }
})

export default catalogsRouter;