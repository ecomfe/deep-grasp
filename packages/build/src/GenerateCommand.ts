import path from 'node:path';
import fs from 'node:fs/promises';
import pMapSeries from 'p-map-series';
import resolve from 'resolve';
import {Command, Option} from 'clipanion';
import {isEnum} from 'typanion';
import {globby} from 'globby';
import prettier, {Config} from 'prettier';
import {ComponentResult, collectGraspableFromFile} from './parser/react.js';
import logger, {LOG_LEVELS, LogLevel} from './logger.js';
import {ExitError, ExitCode} from './error.js';

const PRETTIER_CONFIG: Config = {
    parser: 'typescript',
    tabWidth: 4,
    printWidth: 120,
    useTabs: false,
    singleQuote: true,
    arrowParens: 'avoid',
};

interface GenerateResult {
    components: ComponentResult[];
}

type OutputFormat = 'json' | 'module';

export default class GenerateCommand extends Command {
    static paths = [['generate']];

    static usage = {
        description: 'Collect and generate code for Deep Grasp',
    };

    cwd = Option.String(
        '--cwd',
        process.cwd(),
        {
            description: 'specify current working directory, default to process.cwd()',
        }
    );

    includes = Option.Array(
        '--includes',
        {
            required: false,
            description: 'globs included in analyze',
        }
    );

    excludes = Option.Array(
        '--excludes',
        {
            required: false,
            description: 'globs excluded from analyze',
        }
    );

    format = Option.String<OutputFormat>(
        '--format',
        'module',
        {
            validator: isEnum(['json', 'module']),
            description: 'output format, can be "json" or "module", default to "json"',
        }
    );

    output = Option.String(
        '--output',
        {
            required: false,
            description: 'output file, use "1" for stdout, by default writes to @deep-grasp/build package',
        }
    );

    logLevel = Option.String<LogLevel>(
        '--log-level',
        'info',
        {
            validator: isEnum(LOG_LEVELS),
            description: `specify log level, can be ${LOG_LEVELS.map(v => '"' + v + '"').join(', ')}`,
        }
    );

    async execute(): Promise<number | void> {
        logger.setLevel(this.logLevel);

        const files = await globby(
            this.includes ?? 'src/**/*.tsx',
            {ignore: this.excludes, cwd: this.cwd, absolute: true}
        );

        logger.info(`Found ${files.length} files to analyze`);

        try {
            const components = await pMapSeries(files, v => collectGraspableFromFile(v, this.cwd));
            const result: GenerateResult = {
                components: components.flat(),
            };
            logger.verbose(`Format to ${this.format} code`);
            const code = await this.serialize(result);
            await this.writeToDisk(code);
        }
        catch (ex) {
            if (ex instanceof ExitError) {
                process.exit(ex.code);
            }

            logger.error(`Unknown error: ${ex instanceof Error ? ex.message : ex}`);
            process.exit(ExitCode.Unknown);
        }
    }

    private async serialize(result: GenerateResult) {
        switch (this.format) {
            case 'module':
                return this.serializeToModule(result);
            default:
                return this.serializeToJson(result);
        }
    }

    private toSourceCode(result: ComponentResult) {
        const loadFunctionCode = `() => import('${result.file}').then(named('${result.exportName}'))`;
        return `{definition: ${JSON.stringify(result.definition)}, load: ${loadFunctionCode}}`;
    }

    private async serializeToModule({components}: GenerateResult) {
        const values = components.flat().map(this.toSourceCode);
        const header = 'const named = name => module => module[name];';
        const componentsBody = `export const components = [${values.join(',')}];`;
        const code = await prettier.format(header + '\n\n' + componentsBody, PRETTIER_CONFIG);
        return code;
    }

    private async serializeToJson(result: GenerateResult) {
        return JSON.stringify(result, null, 4);
    }

    private async writeToDisk(content: string) {
        if (this.output) {
            await fs.writeFile(this.output, content);
            logger.info(`Generated content writes to ${this.output}`);
            return;
        }

        try {
            const destination = path.join(
                path.dirname(resolve.sync('@deep-grasp/core', {basedir: this.cwd})),
                `generated.${this.format === 'json' ? 'json' : 'js'}`
            );
            await fs.writeFile(destination, content);
            logger.info('Content generated successfully, use "import @deep-grasp/generated" to reference them');
        }
        catch {
            logger.error(`Unable to resolve @deep-grasp/core from ${this.cwd}`);
            process.exit(ExitCode.WriteError);
        }
    }
}
