function validate(options) {
    if(options["download-target"] == undefined) {
        throw new Error("Download target must be specified.");
    }
    var items = options.items || [];
    if(items.length == 0) {
        throw new Error("There are no items.");
    }
    for(var name in items) {
        var item = items[name];
        if(item["source"] == "") {
            throw new Error("Source cannot be empty.");
        }
    }
    return true;
}

exports.validate = validate;