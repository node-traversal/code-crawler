#!/usr/bin/env node

const _ = require('lodash');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const util = require('util');
const treeify = require('treeify');

const parser = require('../src/index');
const reactPlugin = require('../src/parser-plugin-react');

program
    .command('read <dir>')
    .action((dir) => {
        const fullPath = path.resolve(dir);
        console.log('parse %s', fullPath);
        if (!fs.existsSync(fullPath)) {
            console.log(colors.red(`[ERROR] target directory does not exist: ${fullPath}`));
            process.exit(1);
        }
        parser(`${fullPath}`, [reactPlugin], (data) => {
            console.log('done!', util.inspect(data, { depth: 14 }));
        });
        console.log('finished?');
    });

const noTraverse = {
    '@material-ui/core/styles/useTheme': true,
    '@material-ui/core/styles/defaultTheme': true,
    '@material-ui/core/InputBase': true,
    '@material-ui/core/Modal': true,
    '@material-ui/core/styles/withStyles': true
};

const hidden = {
    clsx: true,
    react: true,
    'react-dom': true,
    'prop-types': true
};

const shouldTraverse = (key) => _.isUndefined(noTraverse[key]);
const isVisible = (key) => _.isUndefined(hidden[key]);


program
    .command('tree <dir>')
    .action((dir) => {
        const fullPath = path.resolve(dir);
        console.log('parse %s', fullPath);
        if (!fs.existsSync(fullPath)) {
            console.log(colors.red(`[ERROR] target directory does not exist: ${fullPath}`));
            process.exit(1);
        }
        parser(`${fullPath}`, [reactPlugin], (data) => {
            const tree = {};
            _.forIn(data, (item, key) => {
                const deps = tree[key] || {};
                if (item.deps && shouldTraverse(key)) {
                    item.deps.forEach((dep) => {
                        if (isVisible(dep.name)) {
                            let prevDep = tree[dep.name];
                            if (!prevDep) {
                                prevDep = {};
                                tree[dep.name] = prevDep;
                            }

                            deps[dep.name] = prevDep;
                        }
                    });
                }
                tree[key] = deps;
            });
            const entryPointName = '@material-ui/core';
            console.log(treeify.asTree(tree[entryPointName]));
        });
        console.log('finished?');
    });

program.parse(process.argv);

program.on('command:*', () => {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});
