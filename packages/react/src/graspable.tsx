import {ComponentType, ReactElement} from 'react';
import {JSONSchema7Definition} from 'json-schema';

export interface GraspableOptions {
    render?: (element: ReactElement) => ReactElement;
}

export interface GraspableComponentDescription {
    name?: string;
    props?: JSONSchema7Definition;
    description: string;
}

type O = Record<string, any>;

export function graspable<P extends O>(
    ComponentIn: ComponentType<P>,
    description: string | GraspableComponentDescription,
    options?: GraspableOptions
) {
    function ComponentOut(props: P) {
        const element = <ComponentIn {...props} />;
        return options?.render ? options.render(element) : element;
    }
    ComponentOut.graspable = typeof description === 'object' ? description : {description};
    ComponentOut.displayName = `graspable(${ComponentIn.displayName || ComponentIn.name})`;
    return ComponentOut;
}
