/** This too will clean up the languages keys if they are not used anywhere in the code */

const fs = require('fs');
const path = require('path');

const dryRun = false;

let allKeys = {};
const files = fs.readdirSync(__dirname);
for (const file of files) {
    if (file.indexOf('.json') >= 0) {
        const content = JSON.parse(fs.readFileSync(__dirname + '/' + file));
        allKeys = { ...allKeys, ...content };
    }
}
allKeys = Object.keys(allKeys);

console.log(allKeys.length);

let srcFiles = [];
let srcPath = __dirname + '/../../src/';
function throughDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const abs = path.join(directory, file);
        if (fs.statSync(abs).isDirectory()) return throughDirectory(abs);
        else return srcFiles.push(abs);
    });
}
throughDirectory(srcPath);

const foundKeys = {};
for (const srcFile of srcFiles) {
    if (
        srcFile.indexOf('.tsx') >= 0 ||
        srcFile.indexOf('.ts') >= 0 ||
        srcFile.indexOf('.jsx') >= 0 ||
        srcFile.indexOf('.js') >= 0
    ) {
        const content = fs.readFileSync(srcFile);
        for (const key of allKeys) {
            if (!foundKeys[key]) foundKeys[key] = 0;
            //We keep the apps translations
            if (content.indexOf(key) >= 0 || key.indexOf('app.name.') === 0) {
                foundKeys[key]++;
            }
        }
    }
}

const found = Object.keys(foundKeys).filter(key => foundKeys[key] > 0);
const notFound = Object.keys(foundKeys).filter(key => foundKeys[key] == 0);

console.log('Found: ', found.length);
console.log('Not found: ', notFound.length);

if (!dryRun) {
    for (const file of files) {
        if (file.indexOf('.json') >= 0) {
            const content = JSON.parse(fs.readFileSync(__dirname + '/' + file));
            for (const remove of notFound) {
                delete content[remove];
            }
            fs.writeFileSync(__dirname + '/' + file, JSON.stringify(content, null, 4));
        }
    }
}
