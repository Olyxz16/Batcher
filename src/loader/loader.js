const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function loadItems(options) {
    return new Promise((resolve, reject) => {
      loadAux(options, [], resolve);
    });
}

async function loadAux(options, fulfilled, resolve) {
  if(Object.keys(options["items"]).length === 0) {
    resolve(fulfilled);
  }
  for(let tag in options.items) {

    let item = options.items[tag];
    if(item["depends"] != undefined && !item["depends"].every(v => fulfilled.includes(v))) {
      continue;
    }

    download(item)
    .then(() => {
      console.log("fulfilled");
      fulfilled.push(tag);
      delete options["items"][tag];
      loadAux(options, fulfilled, resolve)})
    .catch(() => {
      console.log("rejected");
      delete options["items"][tag];
    });
  }
}


async function download(item) {

    let source = item["source"];
    let downloadFolder = item["download-folder"];
    let installFolder = item["install-folder"];
    let fileName = item["file-name"];
    let target = path.join(downloadFolder, fileName);

    return new Promise((resolve, reject) => {
      axios({
        url: source,
        method: 'GET',
        responseType: 'stream'
      })
        .then(response => {
          response.data.pipe(fs.createWriteStream(target));
          response.data.on('end', () => resolve());
        })
        .catch(error => {
          reject(error);
        });
    });
  }

exports.loadItems = loadItems;