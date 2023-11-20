import {describe, test, expect} from 'vitest';
import Parser from 'tree-sitter';
// @ts-expect-error No type definitions
import TypeScript from 'tree-sitter-typescript';
import {findNodesInTree, findNamedImport, resolveExportName} from '../utils.js';

const parser = new Parser();
parser.setLanguage(TypeScript.tsx);

describe('findNodeInTree', () => {
    test('found top level', () => {
        const code = 'add(1, 2);';
        const program = parser.parse(code).rootNode;
        const nodes = findNodesInTree(program, v => v.type === 'call_expression' && v.firstChild?.text === 'add');
        expect(nodes.length).toBe(1);
    });

    test('found nested', () => {
        const code = 'console.log(add(1, 2));';
        const program = parser.parse(code).rootNode;
        const nodes = findNodesInTree(program, v => v.type === 'call_expression' && v.firstChild?.text === 'add');
        expect(nodes.length).toBe(1);
    });
    test('found multiple', () => {
        const code = 'add(1, add(2, 3));';
        const program = parser.parse(code).rootNode;
        const nodes = findNodesInTree(program, v => v.type === 'call_expression' && v.firstChild?.text === 'add');
        expect(nodes.length).toBe(2);
    });

    test('not found', () => {
        const code = 'add(1, 2)';
        const program = parser.parse(code).rootNode;
        const nodes = findNodesInTree(program, v => v.type === 'call_expression' && v.firstChild?.text === 'subtract');
        expect(nodes.length).toBe(0);
    });
});

describe('findNamedImport', () => {
    test('match source & name', () => {
        const code = 'import {foo} from \'bar\';';
        try {
            const program = parser.parse(code).rootNode;
            expect(findNamedImport(program, 'bar', 'foo')).toBe('foo');
        }
        catch (ex) {
            console.error(ex);
        }
    });

    test('multiple named', () => {
        const code = 'import {foo, bar} from \'bar\';';
        try {
            const program = parser.parse(code).rootNode;
            expect(findNamedImport(program, 'bar', 'foo')).toBe('foo');
        }
        catch (ex) {
            console.error(ex);
        }
    });

    test('match source no name', () => {
        const code = 'import {bar} from \'bar\';';
        const program = parser.parse(code).rootNode;
        expect(findNamedImport(program, 'bar', 'foo')).toBe(false);
    });

    test('default import', () => {
        const code = 'import bar from \'bar\';';
        const program = parser.parse(code).rootNode;
        expect(findNamedImport(program, 'bar', 'foo')).toBe(false);
    });

    test('side-effect only import', () => {
        const code = 'import \'bar\';';
        const program = parser.parse(code).rootNode;
        expect(findNamedImport(program, 'bar', 'foo')).toBe(false);
    });

    test('rename', () => {
        const code = 'import {bar as foo} from \'bar\';';
        const program = parser.parse(code).rootNode;
        expect(findNamedImport(program, 'bar', 'bar')).toBe('foo');
    });

    test('default & name mix', () => {
        const code = 'import bar, {foo} from \'bar\';';
        const program = parser.parse(code).rootNode;
        expect(findNamedImport(program, 'bar', 'foo')).toBe('foo');
    });
});

describe('resolveExportName', () => {
    test('default export', () => {
        const code = 'export default add(1, 2);';
        const program = parser.parse(code).rootNode;
        const functionCallNode = program.firstNamedChild?.firstNamedChild!;
        expect(resolveExportName(functionCallNode)).toBe('default');
    });

    test('export const declaration', () => {
        const code = 'export const result = add(1, 2);';
        const program = parser.parse(code).rootNode;
        const functionCallNode = program.firstNamedChild?.firstNamedChild?.firstNamedChild?.lastNamedChild!;
        expect(resolveExportName(functionCallNode)).toBe('result');
    });
});
