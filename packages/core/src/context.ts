export interface ContextData {
    /** An unique identifier of this data, used to find and replace it's data */
    id: string;
    /** A message to descibe current data or context */
    message: string;
    /** Any data corresponding to message, must be serializable to JSON */
    data?: any;
    /** Whether this context is active or not, inactive data will not be sent to LLM */
    active: boolean;
}

export class ContextManager {
    private readonly context: ContextData[];

    constructor(system?: string[]) {
        this.context = (system ?? []).map(v => ({id: crypto.randomUUID(), message: v, active: true}));
    }

    addContextData(message: string, data?: any) {
        const id = crypto.randomUUID();
        this.context.push({id, message, data, active: true});
        return id;
    }

    replaceContextData(id: string, message: string, data?: any) {
        const index = this.context.findIndex(item => item.id === id);
        if (index !== -1) {
            this.context[index].message = message;
            this.context[index].data = data;
            this.context[index].active = true;
        }
    }

    revokeContextData(id: string) {
        const index = this.context.findIndex(item => item.id === id);
        if (index !== -1) {
            this.context[index].active = false;
        }
    }

    read() {
        return this.context.slice();
    }
}
