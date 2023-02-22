const fs = require('fs');

function validate(options) {
    if(options["download-folder"] == undefined) {
        throw new Error("Download folder must be specified.");
    }
    if(!fs.existsSync(options["download-folder"])) {
        throw new Error("Download folder does not exist.");
    }
    let items = options.items || [];
    if(items.length == 0) {
        throw new Error("There are no items.");
    }
    for(let name in items) {
        let item = items[name];
        if(item["source"] == "") {
            throw new Error("Source cannot be empty.");
        }
    }
    return true;
}

exports.validate = validate;