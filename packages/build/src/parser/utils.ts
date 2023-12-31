import path from 'node:path';
import {snakeCase} from 'change-case';
import {SyntaxNode} from 'tree-sitter';

export function findNodesInTree(root: SyntaxNode, match: (node: SyntaxNode) => boolean) {
    const found: SyntaxNode[] = [];
    const walk = (node: SyntaxNode) => {
        if (match(node)) {
            found.push(node);
        }

        for (const child of node.children) {
            walk(child);
        }
    };
    walk(root);
    return found;
}

export function findNamedImport(program: SyntaxNode, source: string, named: string): string | false {
    if (program.type !== 'program') {
        return false;
    }

    const importStatementNodes = program.namedChildren.filter(v => v.type === 'import_statement');
    for (const importStatementNode of importStatementNodes) {
        // import 'foo';
        if (importStatementNode.namedChildCount < 2) {
            continue;
        }

        const sourceNode = importStatementNode.lastNamedChild;

        if (sourceNode?.firstNamedChild?.text !== source) {
            continue;
        }

        // import_statement -> import_clause -> named_imports -> import_specifier -> name & alias
        const importCluaseNode = importStatementNode.firstNamedChild;
        const namedImportsNode = importCluaseNode?.namedChildren.find(v => v.type === 'named_imports');
        const importSpecifierNodes = namedImportsNode?.namedChildren ?? [];
        const found = importSpecifierNodes.find(v => v.firstNamedChild?.text === named);

        if (found) {
            // import {foo as bar} from 'foo';
            return found.lastNamedChild?.text ?? named;
        }
    }
    return false;
}

function findClosestParent(node: SyntaxNode, match: (node: SyntaxNode) => boolean): SyntaxNode | null {
    if (match(node)) {
        return node;
    }

    return node.parent && findClosestParent(node.parent, match);
}

export function resolveExportName(node: SyntaxNode) {
    const exportStatementNode = findClosestParent(node, v => v.type === 'export_statement');

    if (!exportStatementNode) {
        return false;
    }

    // export const
    if (exportStatementNode.firstNamedChild?.type === 'lexical_declaration') {
        // declaration -> variable_declarator -> name
        const nameNode = exportStatementNode.firstNamedChild.firstNamedChild?.firstNamedChild;
        return nameNode?.text ?? false;
    }

    return 'default';
}

export function resolveComponentName(functionName: string | undefined, filename: string | undefined) {
    if (functionName) {
        return functionName;
    }

    if (!filename) {
        return '';
    }

    const file = path.basename(filename, path.extname(filename));
    return file === 'index' ? path.dirname(filename).split(path.sep).pop() : file;
}

function join(x: string, y: string) {
    const xParts = snakeCase(x).split('_');
    const yParts = snakeCase(y).split('_');
    const dedupe = yParts.at(0);
    while (xParts.length && xParts.at(-1) === dedupe) {
        xParts.pop();
    }
    return xParts.concat(yParts).join('_');
}

function stripUnwantedFromFilePath(file: string) {
    const strip = [
        // 去掉文件名和后缀
        /\.tsx?$/,
        // 文件是`index.tsx`时不要这部分
        /\/index$/,
        // 相对路径的前面部分去掉
        /^(\.\.\/)+/,
        // 去掉`src/`目录
        /^src\//,
        // 去掉几个和组件有关的目录，这些目录出现在中间也要去掉
        /(component|page|module)s?\//g,
    ];
    return strip.reduce((result, v) => result.replace(v, ''), file);
}

export function calculateFunctionNameFromComponent(componentName: string, file: string) {
    return join(
        stripUnwantedFromFilePath(file),
        componentName.replace(/^Graspable/, '')
    );
}
