function resolveDependencies(options) {
    var items = options.items;
    var result = {};
    for(var name in items) {
        var dependencies = items[name].depends || [];
        var isAddable = dependencies.every(v => options.items[v] != undefined);
        if(isAddable) {
            for(var index in dependencies) {
                var dep = dependencies[index];
                result[dep] = items[dep];
                delete items[dep];
            }
            if(result[name] == undefined) {
                result[name] = items[name];
            }
        } else {
            throw new Error("Item : " + name + " cannot be loaded. Missing dependencies.");
        }
    }
    return result;
}

exports.resolveDependencies = resolveDependencies;