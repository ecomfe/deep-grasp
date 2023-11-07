import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {GraspProvider} from '@deep-grasp/react';
import '@/styles';
import App from '@/components/App';
import {components, system} from './meta';
import {invokeService} from './service';

const root = createRoot(document.body.appendChild(document.createElement('div')));
root.render(
    <StrictMode>
        <GraspProvider service={invokeService} components={components} system={system}>
            <App />
        </GraspProvider>
    </StrictMode>
);
