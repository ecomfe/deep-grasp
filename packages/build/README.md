# @deep-grasp/build

Command line tool to help integrate with `deep-grasp`.

## Install

```shell
npm install -D @deep-grasp/build
```

When installed, a `deep-grasp` command is available.

## Generate graspable code

Use `deep-grasp generate` to analyze your project source code and generate graspable code for you.

```text
--cwd #0         specify current working directory, default to process.cwd()
--includes #0    globs included in analyze
--excludes #0    globs excluded from analyze
--format #0      output format, can be "json" or "module", default to "json"
--output #0      output file, use "1" for stdout, by default writes to @deep-grasp/build package
```

By default, `deep-grasp generate` scans all your `.tsx` files inside `src` directory, detecting all `import {graspable} from '@deep-grasp/core` statements and `graspable()` calls, collecting description and props definition of components.

### Limitation

You should import `graspable` function using a named import.

```ts
import {graspable} from '@deep-grasp/react';

graspable(/* ... */);
```

Named import can be aliased, so this is supported (but not recommended):

```ts
import {graspable as g} from '@deep-grasp/react';

g(/* ... */);
```

When invoing `graspable()` function, you must pass a component type directly to its first argument, this cannot be a call of HoC or other complex expressions, so these are **NOT** supported:

```ts
graspable(memo(MyComponent));

graspable(MyComponent.Label);
```

Also, once your component has a `props` parameter, it must be attached a type annotation, this annotation must be a direct type reference, any type helper like `Partial`, `Pick` and `Omit` are not supported, `any` is also unsuported.

Your component's `props` type must be easy to analyze, it requires that:

1. No union and intersection types, except usage of string literal union on fields.
2. No complex type helpers like `Partial`, `Omit`, etc.
3. No reference to third-party types, we don't scan `node_modules`.

### Specify output format

`deep-grasp generate` output a JavaScript module code by default, this looks like:

```ts
const named = name => module => module[name];

export const components = [
    {
        definition: {
            name: 'auto_generated_function_name',
            description: 'hello world',
            props: {
                type: 'object',
                properties: {message: {type: 'string', description: 'Greeting message to display to users'}},
                required: ['message'],
                additionalProperties: false,
            },
        },
        load: () => import('file_path_to_component').then(named('default')),
    },
];
```

You can also ask to output a JSON format by using `--format=json`, generated JSON forms in this way:

```json
{
  "components": [
    {
      "file": "file_path_to_component",
      "exportName": "default",
      "definition": {
        "name": "auto_generated_function_name",
        "description": "hello world",
        "props": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string",
              "description": "Greeting message to display to users"
            }
          },
          "required": [
            "message"
          ],
          "additionalProperties": false
        }
      }
    }
  ]
}
```

### Output to file

To keep it simple, `deep-grasp generate` will find `@deep-grasp/core` package based on your project, you must have it installed.

Generated code is by default written to `@deep-grasp/core/dist/generated.{ts|json}`, you can reference them by `import {components} from '@deep-grasp/core'`.

You can also specify the output file using `--output=path/to/file`, this will overwrite the default generated code, we don't validate the file extension so keep in mind to use `.json` when `--format=json`.
