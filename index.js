/*
    Meme principe que docker, une commande lit un fichier dans le dossier,
    et dans l'ordre :
        - parse chaque item et les place dans un array
        - établis l'ordre d'installation en fonction des dépendances
        - installe chaque item et garde en mémoire l'état d'installation (done, checked, failed)
*/

const fs = require("fs");
const path = require("path");

const { parse } = require("./src/parser/parser.js");
const { validate } = require("./src/parser/validator.js");
const { resolvePackages, resolveOptions} = require("./src/resolver/optionsSolver.js");
const { resolveDependencies } = require("./src/resolver/dependencySolver.js");
const { load } = require("./src/loader/loader.js")

const defaultFileName = "batcher.yml";


(async () => {
    
    var args = process.argv;
    var filePath = path.join(__dirname, args[2] || defaultFileName);
    if(!fs.existsSync(filePath)) {
        throw new Error("File does not exist: " + filePath);
    }
    var yamlString = fs.readFileSync(filePath, 'utf8');

    // vérifier que le format soit respecté
    var options = parse(yamlString);
    
    validate(options);
    options = await resolvePackages(options);
    options = resolveOptions(options);

    options["items"] = resolveDependencies(options);
    
    console.log(options);

    var results = await load(options);
    
})(); 