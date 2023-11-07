import {ComponentType, ReactElement} from 'react';

export interface GraspableOptions {
    render?: (element: ReactElement) => ReactElement;
}

type O = Record<string, any>;

export function graspable<P extends O>(ComponentIn: ComponentType<P>, description: string, options?: GraspableOptions) {
    function ComponentOut(props: P) {
        const element = <ComponentIn {...props} />;
        return options?.render ? options.render(element) : element;
    }
    ComponentOut.graspable = {description};
    ComponentOut.displayName = `graspable(${ComponentIn.displayName || ComponentIn.name})`;
    return ComponentOut;
}
