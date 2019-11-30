const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { convertImport } = require('./module-utils');

const parserReactCode = (code, options, plugins) => {
    const parserOptions = options.parserOptions || {
        sourceType: 'module',
        plugins: ['classProperties']
    };

    const importResolution = {};
    const dependencies = [];
    const results = {};
    const parserPlugins = [];
    if (plugins) {
        plugins.forEach((plugin) => {
            parserPlugins.push(plugin.build());
        });
    }

    const parserConfiguration = {
        ExportAllDeclaration: (path) => {
            if (path.node.source) {
                const name = convertImport(path.node.source.value, options);
                dependencies.push({
                    name
                });
            }
        },
        ExportNamedDeclaration: (path) => {
            if (path.node.specifiers) {
                path.node.specifiers.forEach((spec) => {
                    if (path.node.source) {
                        const variable = spec.local.name;
                        const name = convertImport(path.node.source.value, options);
                        dependencies.push({
                            var: variable,
                            name
                        });
                        importResolution[variable] = name;
                    } else {
                        console.log(path.node);
                    }

                });
            }
        },
        ImportDeclaration: (path) => {
            path.node.specifiers.forEach((spec) => {
                const variable = spec.local.name;
                const name = convertImport(path.node.source.value, options);
                dependencies.push({
                    var: variable,
                    name
                });
                importResolution[variable] = name;
            });
        },
        CallExpression: (path) => {
            if (path.node.callee.name === 'require'
                && path.node.arguments.length === 1
                && path.node.arguments[0].type === 'StringLiteral') {
                const name = path.node.arguments[0].value;
                const declaration = {
                    name
                };
                if (path.parent.type === 'VariableDeclarator') {
                    const variable = path.parent.id.name;
                    declaration.var = variable;
                    importResolution[variable] = name;
                }

                dependencies.push(declaration);
            }
        }
    };

    parserPlugins.forEach((plugin) => {
        plugin.configure(parserOptions, parserConfiguration);
    });

    const ast = babelParser.parse(code, parserOptions);
    traverse(ast, parserConfiguration);

    if (dependencies.length > 0) {
        results.deps = dependencies;
    }

    parserPlugins.forEach((plugin) => {
        plugin.buildResults(results);
    });

    return results;
};

module.exports.parserReactCode = parserReactCode;
