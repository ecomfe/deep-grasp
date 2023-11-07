import styled from '@emotion/styled';
import {ReactNode} from 'react';

interface SideProps {
    side: 'left' | 'right';
}

const Content = styled.div<SideProps>`
    padding: 8px 20px;
    border-radius: 4px;
    max-width: 80%;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: break-word;
    background-color: ${({side}) => (side === 'left' ? '#e6e6e6' : '#0cabf3')};
    color: ${({side}) => (side === 'left' ? '#000' : '#fff')};
`;

const Layout = styled.div<SideProps>`
    display: flex;
    justify-content: ${({side}) => (side === 'left' ? 'flex-start' : 'flex-end')};
    width: 100%;
`;

interface Props {
    role: 'user' | 'assistant';
    children: ReactNode;
}

export default function Message({role, children}: Props) {
    return (
        <Layout side={role === 'user' ? 'right' : 'left'}>
            <Content side={role === 'user' ? 'right' : 'left'}>
                {children}
            </Content>
        </Layout>
    );
}
