async function resolveTypes(options) {
    let items = options.items;
    for(let name in items) {
        let item = items[name];
        let source = item.source;
        if(isSourceExecutable(source)) {
            item["type"] = "executable";
        } else if(isSourceRepository(source)) {
            item["type"] = "repository";
        } else if(isSourceURL(source)) {
            item["type"] = "source";
        } else {
            item["type"] = "package";
        }
    }
    return options;
}

function isSourceExecutable(source) {
    let regex = new RegExp("http?s://.*\.exe");
    return regex.test(source);
}
function isSourceRepository(source) {
    let regex = new RegExp("http?s://.*\.git");
    return regex.test(source);
}


async function resolvePackages(options) {
    let items = options.items;
    for(let name in items) {
        let item = items[name];
        let source = item.source;
        if(isSourceURL(source)) {
            continue;
        }
        let package = source.split('@');
        let packageName = package[0];
        let version = package[1] || "latest";
        let packageURL = getPackageByName(packageName, version);
        item.source = packageURL;
        item.type = "package";
    }
    return options;
}
// trouver comment gérer les packages 
function getPackageByName(packageName, version) {
    return "https://github.com/Olyxz16/Batcher.git";
}
function isSourceURL(source) {
    let regex = new RegExp("http?s://.*");
    return regex.test(source);
}

function resolveOptions(options) {
    let downloadTarget = options["download-folder"];
    for(let name in options.items) {
        let item = options.items[name];
        item["download-folder"] ||= downloadTarget;
        item["file-name"] ||= getNameByURL(item["source"]);
    }
    return options;
}

function getNameByURL(url) {
    let name = url.slice(url.lastIndexOf("/") + 1);
    return name;
}

exports.resolveTypes = resolveTypes;
exports.resolvePackages = resolvePackages;
exports.resolveOptions = resolveOptions;