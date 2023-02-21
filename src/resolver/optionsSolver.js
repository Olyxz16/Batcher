async function resolvePackages(options) {
    var items = options.items;
    for(var name in items) {
        var item = items[name];
        var source = item.source;
        if(isSourceURL(source)) {
            continue;
        }
        var package = source.split('@');
        var packageName = package[0];
        var version = package[1] || "latest";
        var packageURL = getPackageByName(packageName, version);
        items[name].source = packageURL;
    }
    return options;
}
function getPackageByName(packageName, version) {
    return packageName + "#" + version;
}
function isSourceURL(source) {
    var regex = new RegExp("http?s://.");
    return regex.test(source);
}

function resolveOptions(options) {
    var downloadTarget = options["download-target"];
    for(var name in options.items) {
        var item = options.items[name];
        item["download-target"] ||= downloadTarget;
    }
    return options;
}

exports.resolvePackages = resolvePackages;
exports.resolveOptions = resolveOptions;