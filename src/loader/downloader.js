const axios = require('axios');
const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const child_process = require('child_process');

async function downloadItems(item) {
  return new Promise((resolve, reject) => {
    let type = item["type"];
    switch(type) {
      case "file": {
        downloadFile(item)
        .then(() => resolve())
        .catch(err => reject(err));
      }; break;
      case "repository": {
          downloadRepository(item)
          .then(() => resolve())
          .catch(err => reject(err));
      }; break;
      case "package": {
          downloadPackage(item)
          .then(() => resolve())
          .catch(err => reject(err));
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
      streamURLToFile(source, target)
        .then(() => {
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
    });
}
function isFileArchive(path) {
  return path.match(".*\.(zip|rar)$");
}

async function downloadRepository(item) {

  let source = item["source"];
  let installFolder = item["install-folder"] || item["download-folder"];
  let fileName = item["file-name"];

  if(!fs.existsSync(installFolder)) {
    throw new Error("Install folder " + installFolder + " does not exist.");
  }

  if(isGitInstalled()) {
    child_process.execSync("cd " + installFolder + " && git clone --depth 1 " + source);
  } else {
    let branchURL = source.replace("https://github.com/", "https://api.github.com/repos/");
    branchURL = path.join(path.parse(branchURL).dir, path.parse(branchURL).name);
    const default_branch = (await axios.get(branchURL)).data.default_branch;

    source = source.replace(".git",  "/archive/refs/heads/" + default_branch + ".zip");
    item["source"] = source;
    item["type"] = "file";
    item["file-name"] = fileName.replace(".git", ".zip");
    downloadFile(item);
  }

}
async function isGitInstalled() {
  var result = child_process.execSync("where git");
  return fs.existsSync(result);
}



async function downloadPackage(item) {

  let source = item["source"];
  let package = source.split("@");
  let packageName = package[0];
  let packageVersion = package[1];
  let downloadFolder = item["download-folder"];
  let installFolder = item["install-folder"] || downloadFolder;
  let target = path.join(downloadFolder, packageName);
  const url = "https://api.github.com/repos/Olyxz16/BatcherPackages/contents/"+packageName+"?ref=master";

  if(!fs.existsSync(downloadFolder)) {
    throw new Error("Download folder " + downloadFolder + " does not exist.");
  }
  if(!fs.existsSync(installFolder)) {
    throw new Error("Install folder " + installFolder + " does not exist.");
  }

  return new Promise(async (resolve, reject) => {
    let filesURL = [];
    await axios({
      url: url,
      method: 'GET'
    })
      .then((response) => {
        let files = response.data;
        for(let index in files) {
          filesURL.push(files[index].download_url);
        }
      })
      .catch(error => {
        throw error;
      });

    downloadFolder = path.join(downloadFolder, packageName);
    if(!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder);
    }
    let promises = [];
    for(let index in filesURL) {
      let url = filesURL[index];
      var fileDownloadPath = path.join(target, path.parse(url).base);
      promises.push(streamURLToFile(url, fileDownloadPath));
    }
    Promise.all(promises).then(() => {
      var absoluteInstallFolderPath = path.join(path.resolve(installFolder), packageName);
      child_process.execSync("cd " + path.join(downloadFolder, packageName) + " && npm i && npm run-script run " + absoluteInstallFolderPath);
      resolve();
    });
   });
}


function streamURLToFile(url, target) {
  return new Promise((resolve, reject) => {
    axios({
      url: url,
      method: 'GET',
      responseType: 'stream'
    })
      .then(response =>  {
        response.data.pipe(fs.createWriteStream(target));
        response.data.on('end', () => {
          resolve();
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}


exports.downloadItems = downloadItems;
