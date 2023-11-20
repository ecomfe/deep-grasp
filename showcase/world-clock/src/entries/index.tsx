import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {components} from '@deep-grasp/core/generated';
import {GraspProvider} from '@deep-grasp/react';
import '@/styles';
import App from '@/components/App';
import {invokeService} from './service';

const system = ['This is a world clock app, user can choose different timezones and get real time clocks.'];

const root = createRoot(document.body.appendChild(document.createElement('div')));
root.render(
    <StrictMode>
        <GraspProvider service={invokeService} components={components} system={system}>
            <App />
        </GraspProvider>
    </StrictMode>
);
