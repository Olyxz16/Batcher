const { download } = require("./downloader.js");

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



exports.loadItems = loadItems;