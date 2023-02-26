const { downloadItems } = require("./downloader.js");

async function loadItems(options) {
    return new Promise((resolve, reject) => {
      loadAux(options, [], [], [], resolve);
    });
}

async function loadAux(options, fulfilled, rejected, processing, resolve) {
  if(Object.keys(options["items"]).length === 0 && processing.length === 0) {
    resolve(mapResult(fulfilled, rejected));
    return;
  }
  for(let tag in options.items) {
    let item = options.items[tag];
    
    if(item["depends"] != undefined && item["depends"].some(v => rejected.includes(v))) {
      delete options["items"][tag];
      rejected.push(tag);
      loadAux(options, fulfilled, rejected, processing, resolve);
    }
    if(item["depends"] != undefined && !item["depends"].every(v => fulfilled.includes(v))) {
      continue;
    }
    delete options["items"][tag];
    processing.push(tag);
    downloadItems(item)
    .then((result) => {
      fulfilled.push(tag);
      processing.splice(processing.indexOf(tag), 1);
      loadAux(options, fulfilled, rejected, processing, resolve)
    })
    .catch((error) => {
      rejected.push(tag);
      processing.splice(processing.indexOf(tag), 1);
      loadAux(options, fulfilled, rejected, processing, resolve);
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