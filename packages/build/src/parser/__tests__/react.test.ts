import path from 'node:path';
import url from 'node:url';
import {describe, test, expect} from 'vitest';
import {collectGraspableFromFile} from '../react.js';

const currentDirectory = path.dirname(url.fileURLToPath(import.meta.url));

describe('collectGraspableFromFile', () => {
    test('simple', async () => {
        const file = path.join(currentDirectory, 'fixtures', 'simple.tsx');
        const result = await collectGraspableFromFile(file, process.cwd());
        const expected = [
            {
                file,
                exportName: 'default',
                definition: {
                    name: 'parser_tests_fixtures_simple_hello_world',
                    description: 'hello world',
                    props: {type: 'object', properties: {}},
                },
            },
            {
                file,
                exportName: 'GraspableHelloWorld',
                definition: {
                    name: 'parser_tests_fixtures_simple_hello_world',
                    description: 'hello world',
                    props: {type: 'object', properties: {}},
                },
            },
        ];
        expect(result).toEqual(expected);
    });

    test('props', async () => {
        const file = path.join(currentDirectory, 'fixtures', 'props.tsx');
        const result = await collectGraspableFromFile(file, process.cwd());
        const expected = [
            {
                file,
                exportName: 'default',
                definition: {
                    name: 'parser_tests_fixtures_props_hello_world',
                    description: 'hello world',
                    props: {
                        type: 'object',
                        properties: {
                            message: {
                                type: 'string',
                                description: 'Greeting message to display to users',
                            },
                        },
                        required: ['message'],
                        additionalProperties: false,
                    },
                },
            },
            {
                file,
                exportName: 'GraspableWelcome',
                definition: {
                    name: 'parser_tests_fixtures_props_welcome',
                    description: 'welcome',
                    props: {
                        type: 'object',
                        properties: {
                            message: {
                                type: 'string',
                                description: 'Greeting message to display to users',
                            },
                        },
                        required: ['message'],
                        additionalProperties: false,
                    },
                },
            },
        ];
        expect(result).toEqual(expected);
    });

    test.only('custom description', async () => {
        const file = path.join(currentDirectory, 'fixtures', 'description.tsx');
        const result = await collectGraspableFromFile(file, process.cwd());
        const expected = [
            {
                file,
                exportName: 'default',
                definition: {
                    name: 'custom_name',
                    description: 'A custom function',
                    props: {
                        type: 'object',
                        properties: {},
                    },
                },
            },
        ];
        expect(result).toEqual(expected);
    });
});
