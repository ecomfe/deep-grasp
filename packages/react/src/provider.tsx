import {ComponentType, ReactNode, createContext, lazy, useContext, useEffect, useRef, useState} from 'react';
import {ComponentDefinition, ComponentModuleInfo, ContextManager, Service} from '@deep-grasp/core';

export interface ComponentInfo extends ComponentModuleInfo {
    definition: ComponentDefinition;
    component: ComponentType<any>;
}

interface ContextValue {
    service: Service;
    components: ComponentInfo[];
    contextManager: ContextManager;
}

const DEFAULT_CONTEXT_VALUE: ContextValue = {
    service: () => {
        throw new Error('Not implemented');
    },
    components: [],
    contextManager: new ContextManager(),
};

const Context = createContext(DEFAULT_CONTEXT_VALUE);
Context.displayName = 'GraspContext';

interface GraspContextProviderProps {
    /** Function to call model as a service */
    service: Service;
    /** Graspable component info, usually generated automatically */
    components: ComponentModuleInfo[];
    /** System instructions to provide initial context data */
    system: string[];
    /** Child component */
    children: ReactNode;
}

function createLazyComponent(info: ComponentModuleInfo) {
    const loadComponent = async () => {
        const component = await info.load() as ComponentType<any>;

        if (typeof component !== 'function') {
            throw new Error('Component must be a function or class');
        }

        return {default: component};
    };
    return lazy(loadComponent);
}

function compileToContextValue(props: GraspContextProviderProps): ContextValue {
    return {
        service: props.service,
        contextManager: new ContextManager(props.system),
        components: props.components.map(v => ({...v, component: createLazyComponent(v)})),
    };
}

export function GraspProvider(props: GraspContextProviderProps) {
    const [contextValue] = useState(() => compileToContextValue(props));

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
}

export function useGraspContextData(description: string, data?: any) {
    const {contextManager} = useContext(Context);
    const id = useRef('');

    useEffect(
        () => {
            if (id.current) {
                contextManager.replaceContextData(id.current, description, data);
            }
            else {
                id.current = contextManager.addContextData(description, data);
            }

            return () => {
                if (id.current) {
                    contextManager.revokeContextData(id.current);
                }
            };
        },
        [data, description, contextManager]
    );
}

export function useGraspContext() {
    return useContext(Context);
}
