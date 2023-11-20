import {graspable} from '@deep-grasp/react';

interface Props {
    /** Greeting message to display to users */
    message: string;
}

function HelloWorld({message}: Props) {
    return <div>{message}</div>;
}

export default graspable(HelloWorld, 'hello world');

const Welcome = (props: Props) => <div>{props.message}</div>;

export const GraspableWelcome = graspable(Welcome, 'welcome');
