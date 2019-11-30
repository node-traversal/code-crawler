const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const parser = require('../parser');
const reactPlugin = require('../parser-plugin-react');

const basePath = process.cwd();
const examplesPath = path.join(basePath, 'examples/components');

describe('The react parser plugin should', () => {
    const options = {
        basePath: examplesPath,
        packageName: '@my-project/the-package'
    };

    const parse = (file) => {
        const filePath = path.join(examplesPath, file);
        const code = fs.readFileSync(filePath, 'utf-8');
        return parser.parserReactCode(code, _.assign({}, options, { filePath }), [ reactPlugin ]);
    };

    it('parse simple react code', () => {
        expect(parse('simple-example.js')).toMatchSnapshot();
    });

    it('parse pre-es6 react code', () => {
        expect(parse('without-es6.js')).toMatchSnapshot();
    });

    it('parse hook react code', () => {
        expect(parse('draftjs.js')).toMatchSnapshot();
    });

    it('parse scoped react code', () => {
        expect(parse('scoped-package.js')).toMatchSnapshot();
    });

    it('parse simple react prop-types', () => {
        expect(parse('prop-types-simple.js')).toMatchSnapshot();
    });

    it('parse react prop-types with single argument', () => {
        expect(parse('prop-types-single-arg.js')).toMatchSnapshot();
    });

    it('parse react prop-types with enum arguments', () => {
        expect(parse('prop-types-enum-args.js')).toMatchSnapshot();
    });

    it('parse react prop-types with shape', () => {
        expect(parse('prop-types-shape.js')).toMatchSnapshot();
    });

    it('parse react prop-types with required specifier', () => {
        expect(parse('prop-types-required.js')).toMatchSnapshot();
    });

    it('parse complex react prop-types', () => {
        expect(parse('complex-prop-types.js')).toMatchSnapshot();
    });
});
