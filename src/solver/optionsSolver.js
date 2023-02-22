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
        items[name].source = packageURL;
    }
    return options;
}
function getPackageByName(packageName, version) {
    return packageName + "#" + version;
}
function isSourceURL(source) {
    let regex = new RegExp("http?s://.");
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

exports.resolvePackages = resolvePackages;
exports.resolveOptions = resolveOptions;