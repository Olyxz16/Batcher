const { download } = require("./downloader.js");

async function loadItems(options) {
    return new Promise((resolve, reject) => {
      loadAux(options, [], [], [], resolve);
    });
}

async function loadAux(options, fulfilled, rejected, processing, resolve) {
  for(let tag in options.items) {
    let item = options.items[tag];
    if(item["depends"] != undefined && !item["depends"].every(v => fulfilled.includes(v))) {
      continue;
    }
    delete options["items"][tag];
    processing.push(tag);
    download(item)
    .then((result) => {
      console.log("fulfilled : " + tag);
      fulfilled.push(tag);
      processing.splice(processing.indexOf(tag), 1);
      if(Object.keys(options["items"]).length === 0 && processing.length === 0) {
        resolve(fulfilled);
        return;
      }
      loadAux(options, fulfilled, resolve)})
    .catch((error) => {
      console.log("rejected : " + tag);
      rejected.push(tag);
      processing.splice(processing.indexOf(tag), 1);
    });
  }
}

exports.loadItems = loadItems;