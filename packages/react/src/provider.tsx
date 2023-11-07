import {ComponentType, ReactNode, createContext, useContext, useEffect, useRef, useState} from 'react';
import {ComponentDefinition, ContextManager, Service} from '@deep-grasp/core';

export interface ComponentInfo {
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
    components: ComponentInfo[];
    /** System instructions to provide initial context data */
    system: string[];
    /** Child component */
    children: ReactNode;
}

export function GraspProvider({service, components, system, children}: GraspContextProviderProps) {
    const [contextValue] = useState(() => ({service, components, contextManager: new ContextManager(system)}));

    return (
        <Context.Provider value={contextValue}>
            {children}
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
