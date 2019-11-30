const fs = require('fs').promises;
const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const parser = require('./parser');
const { toModuleName } = require('./module-utils');

module.exports = (fullPath, plugins, cb) => {
    const flatMap = {};

    const packageJson = require(path.join(fullPath, 'package.json'));
    const sourcePath = `${fullPath}/src/`;
    const searchPath = path.join(sourcePath, '/**/*.js');
    const basePath = path.resolve(sourcePath);
    const ignoredList = ['**/**/*.test.js', '**/test-utils/*.js'];

    console.log(`Scanning: ${packageJson.name}, glob: ${searchPath}`);


    glob(searchPath, { ignore: ignoredList }, (scanError, files) => {
        const readPromises = [];
        console.log('glob result: ', scanError, files.length);
        files.forEach((file) => {
            console.log(`parsing ${file}`);
            const options = {
                basePath,
                filePath: file,
                packageName: packageJson.name
            };
            readPromises.push(fs.readFile(file)
                .then((fileBuffer) => {
                    const info = parser.parserReactCode(fileBuffer.toString(), options, plugins);
                    return {
                        basePath,
                        file,
                        info,
                        module: toModuleName(file, options)
                    };
                })
                .catch((error) => {
                    console.log('[ERROR] Parsing', file, error);
                    process.exit(1);
                }));
        });
        Promise.all(readPromises).then((contents) => {
            contents.forEach((content) => {
                flatMap[content.module] = content.info;
            });

            cb(flatMap);
        });
    });
};
