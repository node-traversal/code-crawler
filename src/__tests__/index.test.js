const path = require('path');
const scanner = require('../index');
const reactPlugin = require('../parser-plugin-react');

const basePath = process.cwd();
console.log('basePath', basePath);
const examplesPath = path.join(basePath, 'examples/simple');

describe('The scanner should', () => {
    it('parse simple code', (cb) => {
        scanner(examplesPath, [reactPlugin], (results) => {
            expect(results).toMatchSnapshot();
            cb();
        });
    });
});
