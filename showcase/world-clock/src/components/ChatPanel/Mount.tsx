import {ReactElement} from 'react';
import {Boundary} from 'react-suspense-boundary';
import {GraspMount} from '@deep-grasp/react';
import styled from '@emotion/styled';
import Message from './Message';

function renderError(error: Error) {
    return (
        <pre>
            {error.message}
        </pre>
    );
}

function renderMessage(message: string) {
    return <Message role="assistant">{message}</Message>;
}

function renderPending() {
    return <Message role="assistant">AI is working hard</Message>;
}

const ResultContainer = styled.div`
    display: flex;
    justify-content: center;
    background-color: #e6e6e6;
    padding: 20px;
    border-radius: 20px;
`;

function renderElement(element: ReactElement) {
    return (
        <ResultContainer>
            <Boundary pendingFallback={<div>Loading...</div>} renderError={renderError}>
                {element}
            </Boundary>
        </ResultContainer>
    );
}

interface Props {
    query: string;
}

export default function Mount({query}: Props) {
    return (
        <GraspMount
            query={query}
            renderError={renderError}
            renderModelMessage={renderMessage}
            renderPendingOnModelCall={renderPending}
            renderComponentResult={renderElement}
        />
    );
}
