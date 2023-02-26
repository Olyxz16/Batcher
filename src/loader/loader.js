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
      fulfilled.push(tag);
      processing.splice(processing.indexOf(tag), 1);
      if(Object.keys(options["items"]).length === 0 && processing.length === 0) {
        resolve(mapResult(fulfilled, rejected));
        return;
      }
      loadAux(options, fulfilled, resolve)})
    .catch((error) => {
      rejected.push(tag);
      processing.splice(processing.indexOf(tag), 1);
    });
  }
}

function mapResult(fulfilled, rejected) {
  var map = {};
  fulfilled.every(tag => map[tag] = "fulfilled");
  rejected.every(tag => map[tag] = "rejected");
  return map;
}

exports.loadItems = loadItems;