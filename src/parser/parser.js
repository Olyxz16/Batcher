const yamlParser = require("js-yaml");

function parse(yamlString) {    
    const doc = yamlParser.load(yamlString);
    return doc;
}

exports.parse = parse
