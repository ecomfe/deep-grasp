import {ReactElement, createContext, createElement, useContext} from 'react';
import {useGraspContext} from './provider.js';
import {Boundary, useResource} from 'react-suspense-boundary';

export interface InGraspContext {
    query: string;
}

const Context = createContext<InGraspContext | false>(false);
Context.displayName = 'InGraspContext';

interface GraspLoaderProps {
    query: string;
    renderMessageResult: ((message: string) => ReactElement) | undefined;
    renderFunctionResult: ((element: ReactElement) => ReactElement) | undefined;
}

function GraspLoader({query, renderMessageResult, renderFunctionResult}: GraspLoaderProps) {
    const {service, components, contextManager} = useGraspContext();
    const [result] = useResource(
        service,
        {
            query,
            components: components.map(v => v.definition),
            context: contextManager.read(),
        }
    );

    if (result.type === 'function') {
        const target = components.find(v => v.definition.name === result.name);
        if (target) {
            const element = createElement(target.component, result.arguments);
            return renderFunctionResult ? renderFunctionResult(element) : element;
        }
        throw new Error('Unable to locate "${result.name}" in components');
    }

    return renderMessageResult?.(result.content);
}

interface GraspMountProps {
    /** User's natural language input */
    query: string;
    /** Render when idle (without any user query) */
    renderIdle?: () => ReactElement;
    /** Render when invoking LLM */
    renderPendingOnModelCall?: (query: string) => ReactElement;
    /** Render if LLM fails to grasp any usable piece */
    renderModelMessage?: (message: string) => ReactElement;
    /** Render upon successful retrieval of a component */
    renderComponentResult?: (element: ReactElement) => ReactElement;
    /** Render on error from model or locating usable peice */
    renderError?: (error: Error) => ReactElement;
}

export function GraspMount(props: GraspMountProps) {
    const {
        query,
        renderIdle,
        renderPendingOnModelCall,
        renderModelMessage,
        renderComponentResult,
        renderError,
    } = props;

    if (!query) {
        return renderIdle?.();
    }

    return (
        <Context.Provider value={{query}}>
            <Boundary pendingFallback={renderPendingOnModelCall?.(query) ?? null} renderError={renderError}>
                <GraspLoader
                    query={query}
                    renderFunctionResult={renderComponentResult}
                    renderMessageResult={renderModelMessage}
                />
            </Boundary>
        </Context.Provider>
    );
}

export function useInGrasp() {
    return useContext(Context);
}
