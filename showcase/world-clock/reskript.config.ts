import {configure} from '@reskript/settings';

export default configure(
    'webpack',
    {
        build: {
            appTitle: 'World Clock',
            uses: ['emotion'],
        },
        devServer: {
            port: 8788,
            apiPrefixes: ['/api'],
            defaultProxyDomain: 'localhost:3000',
        },
    }
);
