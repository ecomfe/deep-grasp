# @deep-grasp/core

Core types and functions for `deep-grasp`.

## Invoke LLM

To connect with LLM, you need to implement a `Service` function receiving certain request payload and returns a promise resovling to LLM response.

```ts
interface ContextData {
    /** An unique identifier of this data, used to find and replace it's data */
    id: string;
    /** A message to descibe current data or context */
    message: string;
    /** Any data corresponding to message, must be serializable to JSON */
    data?: any;
    /** Whether this context is active or not, inactive data will not be sent to LLM */
    active: boolean;
}

interface ComponentDefinition {
    /** The name of component related to its functionality and usage */
    name: string;
    /** Detailed description on the ability and behaveios of component  */
    description: string;
    /** A JSON schema object to describe component's props */
    props: JSONSchema7;
}

interface ServiceInput {
    /** User's natural language input */
    query: string;
    /** Additional context data prepending in messages send to LLM */
    context?: ContextData[];
    /** Available components for LLM to determine which to use */
    components: ComponentDefinition[];
}

interface ServiceFunctionOutput {
    /** Indicates LLM successfully resolves user query to a certain function */
    type: 'function';
    /** The name of function */
    name: string;
    /** The arguments to be pass when invoking function */
    arguments: any;
}

interface ServiceMessageOutput {
    /** Indicates LLM failed to resolve to a function but instead respond with natural language message */
    type: 'message';
    /** The message content LLM responds */
    content: string;
}

type ServiceOutput = ServiceFunctionOutput | ServiceMessageOutput;

type Service = (input: ServiceInput) => Promise<ServiceOutput>;
```

In brief, a `Service` function should send a HTTP request to server to get a response from LLM supporting the **function calling** feature.

`@deep-grasp/core` package only provides a definition of `Service` function but not directly use it, you'll need to use `@deep-grasp/react` to integrate `Service` into a React app.
