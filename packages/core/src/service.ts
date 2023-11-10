import {JSONSchema7} from 'json-schema';
import {ContextData} from './context.js';

export interface ComponentDefinition {
    /** The name of component related to its functionality and usage */
    name: string;
    /** Detailed description on the ability and behaveios of component  */
    description: string;
    /** A JSON schema object to describe component's props */
    props: JSONSchema7;
}

export interface ComponentModuleInfo {
    /** Definition of component */
    definition: ComponentDefinition;
    /** Async function to fetch corresponding module export */
    load: () => Promise<unknown>;
}

export interface ServiceInput {
    /** User's natural language input */
    query: string;
    /** Additional context data prepending in messages send to LLM */
    context?: ContextData[];
    /** Available components for LLM to determine which to use */
    components: ComponentDefinition[];
}

export interface ServiceFunctionOutput {
    /** Indicates LLM successfully resolves user query to a certain function */
    type: 'function';
    /** The name of function */
    name: string;
    /** The arguments to be pass when invoking function */
    arguments: any;
}

export interface ServiceMessageOutput {
    /** Indicates LLM failed to resolve to a function but instead respond with natural language message */
    type: 'message';
    /** The message content LLM responds */
    content: string;
}

export type ServiceOutput = ServiceFunctionOutput | ServiceMessageOutput;

export type Service = (input: ServiceInput) => Promise<ServiceOutput>;

export interface ChatMesasge {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatFunction {
    name: string;
    description: string;
    parameters: JSONSchema7;
}

export interface ChatModelInput {
    messages: ChatMesasge[];
    functions: ChatFunction[];
}

function convertContextToMessage(item: ContextData): ChatMesasge[] {
    if (!item.active) {
        return [];
    }

    const data = item.data ? ['```json' + JSON.stringify(item.data) + '```'].join('\n') : '';
    return [
        {
            role: 'user',
            content: [item.message, data].join('\n\n').trim(),
        },
        {
            role: 'assistant',
            content: 'OK',
        },
    ];
}

function convertComponentToFunction(item: ComponentDefinition): ChatFunction {
    return {
        name: item.name,
        description: item.description,
        parameters: item.props,
    };
}

export function adaptServiceInputToModel(input: ServiceInput): ChatModelInput {
    return {
        messages: [
            ...(input.context ?? []).flatMap(convertContextToMessage),
            {role: 'user', content: input.query},
        ],
        functions: input.components.map(convertComponentToFunction),
    };
}
