const axios = require('axios');
const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const shell = require('shelljs');

async function download(item) {
  return new Promise((resolve, reject) => {
    let type = item["type"];

    switch(type) {
      case "file": {
        downloadFile(item).then(() => resolve());
      }; break;
      case "repository": {
          downloadRepository(item).then(() => resolve());
      }; break;
      case "package": {
          downloadPackage(item).then(() => resolve());
      }; break;
      default: throw new Error("Unknown type.");
    };
  });
}

async function downloadFile(item) {

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
              decompress(target, targetFolder)
              .then(() => {
                fs.rmSync(target);
                resolve();
              });
            } else {
              fs.renameSync(target, path.join(installFolder, fileName));
              resolve();
            }
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
  let installFolder = item["install-folder"];
  let fileName = item["file-name"];

  if(isGitInstalled()) {
    var cwd = process.cwd();
    shell.cd(installFolder);
    shell.exec("git clone " + source);
    shell.cd(cwd);
  } else {
    source = source.replace(".git",  "/archive/refs/heads/main.zip");
    item["source"] = source;
    item["type"] = "file";
    item["file-name"] = fileName.replace(".git", ".zip");
    downloadFile(item);
  }

}
async function isGitInstalled() {
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }
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
