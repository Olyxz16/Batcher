const axios = require('axios');
const fs = require('fs');
const path = require('path');
const decompress = require('decompress');

async function download(item) {
  return new Promise((resolve, reject) => {
    let type = item["type"];

    switch(type) {
      case "executable" : {
          downloadExecutable(item).then(() => resolve());
      }; break;
      case "source": {
        downloadSource(item).then(() => resolve());
      }; break;
      case "repository": {
          downloadRepository(item).then(() => resolve());
      }; break;
      case "package": {
          downloadPackage(item).then(() => resolve());
      }
      default: throw new Error("Unknown type.");
    };
  });
}

async function downloadExecutable(item) {

  let source = item["source"];
  let downloadFolder = item["download-folder"];
  let fileName = item["file-name"];
  let target = path.join(downloadFolder, fileName);

  if(!fs.existsSync(downloadFolder)) {
    throw new Error("Download folder " + downloadFolder + " does not exist.");
  }

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

async function downloadSource(item) {

  let source = item["source"];
  let downloadFolder = item["download-folder"];
  let installFolder = item["install-folder"] || downloadFolder;
  let fileName = item["file-name"];
  let target = path.join(downloadFolder, fileName);

  if(!fs.existsSync(downloadFolder)) {
    throw new Error("Download folder " + downloadFolder + " does not exist.");
  }
  if(!fs.existsSync(installFolder)) {
    throw new Error("Install folder " + installFolder + " does not exist.");
  }

  return new Promise((resolve, reject) => {
      axios({
        url: source,
        method: 'GET',
        responseType: 'stream'
      })
        .then(response =>  {
          response.data.pipe(fs.createWriteStream(target));
          response.data.on('end', () => {
            if(isFileArchive(fileName)) {
              var targetFolder = path.join(installFolder, path.parse(fileName).name);
              if (!fs.existsSync(targetFolder)){
                fs.mkdirSync(targetFolder);
              }
              decompress(target, targetFolder);
            } else {
              fs.renameSync(downloadFolder, installFolder);
            }
            resolve();
          });
        })
        .catch(error => {
          reject(error);
        });
    });
}
function isFileArchive(path) {
  return path.match(".*\.(zip|rar)$");
}

async function downloadRepository(item) {

  let source = item["source"];
  let downloadFolder = item["download-folder"];
  let fileName = item["file-name"];
  let target = path.join(downloadFolder, fileName);

  if(!fs.existsSync(downloadFolder)) {
    throw new Error("Download folder " + downloadFolder + " does not exist.");
  }

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



async function downloadPackage(item) {

  let source = item["source"];
  let downloadFolder = item["download-folder"];
  let fileName = item["file-name"];
  let target = path.join(downloadFolder, fileName);

  if(!fs.existsSync(downloadFolder)) {
    throw new Error("Download folder " + downloadFolder + " does not exist.");
  }

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

exports.download = download;
