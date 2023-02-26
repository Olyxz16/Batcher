function resolveTypes(options) {
    let items = options.items;
    for(let name in items) {
        let item = items[name];
        let source = item.source;
        if(isSourceRepository(source)) {
            item["type"] = "repository";
        } else if(isSourceURL(source)) {
            item["type"] = "file";
        } else {
            item["type"] = "package";
        }
    }
    return options;
}
function isSourceRepository(source) {
    let regex = new RegExp("http?s://.*\.git");
    return regex.test(source);
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
exports.resolveOptions = resolveOptions;