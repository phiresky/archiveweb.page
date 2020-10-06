"use strict";

import { ArchiveDB } from 'wabac/src/archivedb';
import { CollectionLoader } from 'wabac/src/loaders';

const { ipcRenderer } = require('electron');

//contextBridge.exposeInMainWorld('electron', {'IS_APP': true});
window.IS_APP = true;

const MAIN_DB_KEY = "main.archive";
const db = new ArchiveDB(MAIN_DB_KEY);

const colldb = new CollectionLoader();

console.log("preload");

ipcRenderer.on('add-resource', async (event, data, pageInfo) => {
  await db.initing;

  let writtenSize = 0;
  const payloadSize = data.payload.length;

  try {
    if (await db.addResource(data)) {
      writtenSize = payloadSize;
    }
  } catch (e) {
    console.warn(`Commit error for ${data.url} @ ${data.ts} ${data.mime}`);
    console.warn(e);
    return;
  }

  //colldb.updateSize(MAIN_DB_KEY, payloadSize, writtenSize);

  // increment page size
  db.addPage(pageInfo);
});


ipcRenderer.on('add-page', async (event, pageInfo) => {
  await db.initing;
  db.addPage(pageInfo);
  console.log("add-page", pageInfo);
});