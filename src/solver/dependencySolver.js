function resolveDependencies(options) {
    let items = options.items;
    let result = {};
    for(let name in items) {
        let dependencies = items[name].depends || [];
        let isAddable = dependencies.every(v => options.items[v] != undefined);
        if(isAddable) {
            for(let index in dependencies) {
                let dep = dependencies[index];
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