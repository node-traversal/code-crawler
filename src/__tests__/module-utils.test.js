const path = require('path');
const { convertImport, formatModuleName, toModuleName, convertSeparators } = require('../module-utils');

describe('The module util', () => {
    const basePath = path.join(process.cwd(), 'examples');

    let options;

    beforeEach(() => {
        options = {
            basePath,
            filePath: path.join(basePath, 'components/simple-example.js'),
            namingStandard: (name) => name,
            packageName: '@my-project/the-package'
        };
    });

    describe('convertImport', () => {
        it('should not modify non-relative imports', () => {
            expect(convertImport('prop-types', options)).toEqual('prop-types');
        });

        it('should convert same directory relative import', () => {
            const result = convertImport('./other', options);
            expect(convertSeparators(result)).toContain('/examples/components/other');
        });

        it('should convert different directory relative import', () => {
            const result = convertImport('../other', options);
            expect(convertSeparators(result)).toContain('/examples/other');
        });
    });

    describe('formatModuleName', () => {
        it('should remove trailing slashes and convert separators', () => {
            const result = formatModuleName('\\module-name\\folder\\');
            expect(result).toEqual('module-name/folder');
        });
    });

    describe('toModuleName', () => {
        it('should create standard module name', () => {
            const filePath = path.join(options.basePath, 'examples/other');
            const result = toModuleName(filePath, options);
            expect(result).toEqual('@my-project/the-package/examples/other');
        });

        it('should not contain index (should end in folder instead)', () => {
            const filePath = path.join(options.basePath, 'examples/index');
            const result = toModuleName(filePath, options);
            expect(result).toEqual('@my-project/the-package/examples');
        });

        it('should not contain index at root (should end in package-name instead)', () => {
            const filePath = path.join(options.basePath, 'index');
            const result = toModuleName(filePath, options);
            expect(result).toEqual('@my-project/the-package');
        });
    });
});
