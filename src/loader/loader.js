const { downloadItems } = require("./downloader.js");

async function loadItems(options) {
    return new Promise((resolve, reject) => {
      load(options, [], [], [], resolve);
    });
}

async function load(options, fulfilled, rejected, processing, resolve) {
  if(Object.keys(options["items"]).length === 0 && processing.length === 0) {
    resolve(mapResult(fulfilled, rejected));
    return;
  }
  for(let tag in options.items) {
    let item = options.items[tag];

    item["depends"] ||= [];
    let itemHasDependencies = item["depends"].length > 0;
    let itemHasRejectedDependencies = item["depends"].some(v => rejected.includes(v));
    let itemHasUnprocessedDependencies = !item["depends"].every(v => fulfilled.includes(v));

    if(itemHasDependencies && itemHasRejectedDependencies) {
      delete options["items"][tag];
      rejected.push(tag);
      load(options, fulfilled, rejected, processing, resolve);
    }
    if(itemHasDependencies && itemHasUnprocessedDependencies) {
      continue;
    }
    delete options["items"][tag];
    processing.push(tag);
    downloadItems(item)
    .then((result) => {
      fulfilled.push(tag);
      processing.splice(processing.indexOf(tag), 1);
      load(options, fulfilled, rejected, processing, resolve)
    })
    .catch((error) => {
      rejected.push(tag);
      processing.splice(processing.indexOf(tag), 1);
      load(options, fulfilled, rejected, processing, resolve);
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