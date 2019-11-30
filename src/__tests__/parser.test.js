const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const parser = require('../parser');

const basePath = process.cwd();
const examplesPath = path.join(basePath, 'examples/components');

describe('The parser should', () => {
    const options = {
        basePath: examplesPath,
        packageName: '@my-project/the-package'
    };

    const parse = (file) => {
        const filePath = path.join(examplesPath, file);
        const code = fs.readFileSync(filePath, 'utf-8');
        return parser.parserReactCode(code, _.assign({}, options, { filePath }));
    };

    it('parse export with constant instead of import', () => {
        expect(parse('index-exports-default.js')).toMatchSnapshot();
    });

    it('parse re-export with star import', () => {
        expect(parse('index-re-export-star.js')).toMatchSnapshot();
    });

    it('parse re-export with aliased import', () => {
        expect(parse('index-re-export-alias.js')).toMatchSnapshot();
    });

    it('parse aliased default import', () => {
        expect(parse('import-named-default.js')).toMatchSnapshot();
    });
});
