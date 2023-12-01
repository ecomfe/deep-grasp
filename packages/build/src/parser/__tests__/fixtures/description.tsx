import {graspable} from '@deep-grasp/react';

function HelloWorld() {
    return <div>Hello</div>;
}

export default graspable(
    HelloWorld,
    {
        name: 'custom_name',
        description: 'A custom function',
        props: {
            type: 'object',
            properties: {},
        },
    }
);
