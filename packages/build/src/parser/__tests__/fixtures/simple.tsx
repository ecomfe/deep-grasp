import {graspable} from '@deep-grasp/react';

function HelloWorld() {
    return <div />;
}

export default graspable(HelloWorld, 'hello world');

export const GraspableHelloWorld = graspable(HelloWorld, 'hello world');
