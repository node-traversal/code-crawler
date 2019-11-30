const _ = require('lodash');
const path = require('path');

function convertSeparators(filePath) {
    return filePath.replace(/\\/g, '/');
}

function formatModuleName(moduleName) {
    return _.trimEnd(_.trimStart(convertSeparators(moduleName), '/'), '/');
}

function toModuleName(file, { basePath, packageName }) {
    const fileName = formatModuleName(path.basename(file, path.extname(file)));
    const moduleLocation = formatModuleName(path.resolve(path.dirname(file)).replace(basePath, ''));
    let module = formatModuleName(packageName);

    if (moduleLocation) {
        module = `${module}/${moduleLocation}`;
    }

    if (fileName !== 'index') {
        module = `${module}/${fileName}`;
    }

    return module;
}

function convertImport(importName, options) {
    const namingStandard = options.namingStandard || toModuleName;
    let name = importName;

    if (name.startsWith('.')) {
        const filePath = path.resolve(path.join(path.dirname(options.filePath), name));
        name = namingStandard(filePath, options);
    }
    return name;
}

module.exports.convertSeparators = convertSeparators;
module.exports.formatModuleName = formatModuleName;
module.exports.toModuleName = toModuleName;
module.exports.convertImport = convertImport;
