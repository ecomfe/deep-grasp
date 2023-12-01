import path from 'node:path';
import fs from 'node:fs/promises';
import Parser, {SyntaxNode} from 'tree-sitter';
import JSON5 from 'json5';
// @ts-expect-error No type definitions
import TypeScript from 'tree-sitter-typescript';
import schemaGenerator, {Config} from 'ts-json-schema-generator';
import {JSONSchema7Definition} from 'json-schema';
import {ComponentDefinition} from '@deep-grasp/core';
import {
    calculateFunctionNameFromComponent,
    findNamedImport,
    findNodesInTree,
    resolveComponentName,
    resolveExportName,
} from './utils.js';
import logger from '../logger.js';
import {ExitCode, ExitError} from '../error.js';

const parser = new Parser();
parser.setLanguage(TypeScript.tsx);

export interface ComponentResult {
    definition: ComponentDefinition;
    file: string;
    exportName: string;
}

function extractInfoFromCallNode(node: SyntaxNode) {
    const argumentsNode = node.namedChildren.find(v => v.type === 'arguments');

    if (!argumentsNode) {
        throw new Error('Expect arguments node in call expression');
    }

    const exportName = resolveExportName(node);

    if (!exportName) {
        throw new Error('Expect graspable function call to nest in export statement');
    }

    // graspable(Component, description, options?);
    // `options` is currently irrelevant to code generation
    const descriptionNode = argumentsNode.namedChild(1);

    if (descriptionNode?.type === 'string') {
        return {description: descriptionNode.firstNamedChild?.text, exportName};
    }

    if (descriptionNode?.type === 'object') {
        try {
            const info = JSON5.parse<Partial<ComponentDefinition>>(descriptionNode.text);
            return {...info, exportName};
        }
        catch (ex) {
            throw new Error('Unable to statically parse description object in graspable function call');
        }
    }

    throw new Error('Expect detailed description in graspable function call');
}

function findComponentNode(program: SyntaxNode, identifier: string) {
    const found = findNodesInTree(
        program,
        v => {
            if (v.type === 'function_declaration') {
                return v.firstNamedChild?.text === identifier;
            }
            if (v.type === 'arrow_function') {
                const parent = v.parent;
                return parent?.type === 'variable_declarator' && parent.firstNamedChild?.text === identifier;
            }
            // NOTE: function expression is not supported
            return false;
        }
    );
    return found.at(0) ?? null;
}

const EMPTY_PROP_SCHEMA: JSONSchema7Definition = {type: 'object', properties: {}} as const;

// eslint-disable-next-line consistent-return
function resolveComponentPropSchema(file: string, componentNode: SyntaxNode) {
    const parameters = componentNode.namedChildren.find(v => v.type === 'formal_parameters');

    if (!parameters?.namedChildCount) {
        logger.verbose('    Component has no props, use empty object as schema');
        return EMPTY_PROP_SCHEMA;
    }

    // formal_parameters -> required_parameter | optional_parameter -> type_annotation -> type_identifier
    const typeAnnotationNode = parameters.namedChild(0)?.namedChildren.find(v => v.type === 'type_annotation');
    const typeName = typeAnnotationNode?.firstNamedChild?.text;

    if (!typeName) {
        logger.error('    No type annotation for props parameter');
        throw new ExitError(ExitCode.ParseError);
    }

    const config: Config = {
        path: file,
        // TODO: allow config from cli args
        tsconfig: path.join(process.cwd(), 'tsconfig.json'),
        type: typeName,
        expose: 'all',
        skipTypeCheck: true,
    };
    try {
        const schema = schemaGenerator.createGenerator(config).createSchema(typeName);
        return schema.definitions?.[typeName] ?? EMPTY_PROP_SCHEMA;
    }
    catch (ex) {
        logger.error(`    Failed to generate schema for props: ${ex instanceof Error ? ex.message : ex}`);
        throw new ExitError(ExitCode.ParseError);
    }
}

export async function collectGraspableFromFile(file: string, cwd: string) {
    const relativeFilePath = path.relative(cwd, file);
    logger.verbose(`Start analyze ${relativeFilePath}`);
    const source = await fs.readFile(file, 'utf-8');
    const program = parser.parse(source).rootNode;
    const graspableCalleeName = findNamedImport(program, '@deep-grasp/react', 'graspable');

    if (!graspableCalleeName) {
        logger.verbose('  No graspable import found');
        return [];
    }

    const nodes = findNodesInTree(
        program,
        v => v.type === 'call_expression' && v.firstNamedChild?.text === graspableCalleeName
    );
    const collectForNode = (node: SyntaxNode): ComponentResult | ComponentResult[] => {
        const componentName = resolveComponentName(node.lastNamedChild?.namedChild(0)?.text, file);

        if (!componentName) {
            logger.warn('  Cannot resolve component name from graspable call');
            return [];
        }

        const componentNode = findComponentNode(program, componentName);

        if (!componentNode) {
            logger.warn(`  Cannot find component definition ${componentName} in file`);
            return [];
        }

        logger.verbose(`  Generate definition for component ${componentName}`);
        const propSchema = resolveComponentPropSchema(file, componentNode);
        const info = extractInfoFromCallNode(node);

        if (!info.description) {
            logger.error('  Expect detailed description of component in graspable function call');
            throw new ExitError(ExitCode.ParseError);
        }

        return {
            file,
            exportName: info.exportName,
            definition: {
                name: info.name ?? calculateFunctionNameFromComponent(componentName, relativeFilePath),
                description: info.description,
                props: info.props ?? propSchema,
            },
        };
    };
    const result = nodes.flatMap(collectForNode);
    logger.verbose(`  Collected ${result.length} components`);
    return result;
}
