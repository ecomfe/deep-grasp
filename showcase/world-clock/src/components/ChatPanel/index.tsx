import {Fragment, KeyboardEvent, useCallback, useState} from 'react';
import styled from '@emotion/styled';
import Message from './Message';
import Mount from './Mount';

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: auto;
`;

const Input = styled.input`
    height: 40px;
    font-size: 16px;
    padding: 0 1em;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    outline: none;

    &:hover,
    &:focus {
        outline: none;
        border-color: #0057b7;
    }
`;

const Layout = styled.div`
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 20px;
    padding: 12px;
    height: 100vh;
    background-color: #f1f3f4;
`;

export default function ChatPanel() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const submit = useCallback(
        async (e: KeyboardEvent) => {
            const content = input.trim();
            if (e.key !== 'Enter' || !content) {
                return;
            }

            setMessages(v => [...v, content]);
            setInput('');
        },
        [input]
    );
    const renderMessage = (message: string, index: number) => {
        return (
            <Fragment key={index}>
                <Message role="user">{message}</Message>
                <Mount query={message} />
            </Fragment>
        );
    };

    return (
        <Layout>
            <List>
                <Message role="assistant">
                    Hi, Deep Grasp is now enabled, you can try this:
                    <ul>
                        <li>Show me time in istanbul</li>
                    </ul>
                </Message>
                {messages.map(renderMessage)}
            </List>
            <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={submit} />
        </Layout>
    );
}
