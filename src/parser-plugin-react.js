const _ = require('lodash');

const unknownNode = (obj) => JSON.stringify(_.omit(obj, 'start', 'end', 'loc'));

let transformProps;

const transformArgs = (args) => {
    let finalArgs = [];
    (args || []).forEach((p) => {
        if (p.type === 'StringLiteral' && p.value) {
            finalArgs.push(p.value);
        } else if (p.type === 'Identifier' && p.name) {
            finalArgs.push(p.name);
        } else if (p.type === 'MemberExpression' && p.object) {
            finalArgs.push(p.property.name);
        } else if (p.type === 'ArrayExpression' && p.elements) {
            finalArgs.push(transformArgs(p.elements));
        } else if (p.type === 'ObjectExpression' && p.properties) {
            finalArgs.push(transformProps(p.properties));
        } else {
            finalArgs.push(unknownNode(p));
        }
    });

    if (finalArgs.length === 1) {
        finalArgs = finalArgs[0]; // eslint-disable-line prefer-destructuring
    }

    return finalArgs;
};

transformProps = (properties) => {
    const props = [];

    (properties || []).forEach((p) => {
        if (p.value && p.value.type === 'MemberExpression' && p.value.object) {
            if (p.value.object.type === 'Identifier') {
                if (p.value.object.name === 'PropTypes') {
                    props.push({
                        name: p.key.name,
                        type: p.value.property.name
                    });
                } else {
                    props.push(unknownNode(p));
                }
            } else if (p.value.type === 'MemberExpression' && p.value.object.property) {
                const propObj = {
                    name: p.key.name,
                    type: p.value.object.property.name
                };
                if (p.value.property.name === 'isRequired') {
                    propObj.required = true;
                }
                props.push(propObj);
            } else {
                console.log('huh?', p.object);
            }
        } else if (p.value && p.value.type === 'CallExpression') {
            if (p.value.callee && p.value.callee.object && p.value.callee.object.name === 'PropTypes') {
                props.push({
                    name: p.key.name,
                    type: p.value.callee.property.name,
                    args: transformArgs(p.value.arguments)
                });
            } else if (p.value.callee.name) {
                props.push({
                    name: p.key.name,
                    type: p.value.callee.name
                });
            } else {
                props.push(unknownNode(p));
            }
        } else {
            props.push(unknownNode(p));
        }
    });

    return props;
};

module.exports.build = () => {
    let finalProps = [];

    const reactConfig = {
        AssignmentExpression: (path) => {
            if (path.node.left.property && path.node.left.property.name === 'propTypes') {
                finalProps = transformProps(path.node.right.properties);
            }
        }
    };

    return {
        configure: (options, configuration) => {
            options.plugins.push('jsx');
            _.assign(configuration, reactConfig);
        },
        buildResults: (results) => {
            if (finalProps.length > 0) {
                results.props = finalProps; // eslint-disable-line no-param-reassign
            }
        }
    };
};
