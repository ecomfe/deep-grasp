import {ComponentType, lazy} from 'react';
import {ComponentInfo} from '@deep-grasp/react';

function named<N extends string>(name: N) {
    return (module: Record<N, ComponentType<any>>) => ({default: module[name]});
}

// TODO: These should be generated from a compiler
export const components: ComponentInfo[] = [
    {
        definition: {
            name: 'clock',
            description: 'View clock in specified timezone',
            props: {
                type: 'object',
                properties: {
                    timezone: {
                        type: 'string',
                        description: 'The name of timezone',
                    },
                },
                required: ['timezone'],
            },
        },
        component: lazy(() => import('@/components/Clock')),
    },
    {
        definition: {
            name: 'add_clock_form',
            description: 'Add a new clock by timezone name',
            props: {
                type: 'object',
                properties: {
                    timezone: {
                        type: 'string',
                        description: 'The name of timezone, if no timezone is specified, omit this property',
                    },
                },
            },
        },
        component: lazy(() => import('@/components/AddClock').then(named('AddClockForm'))),
    },
    {
        definition: {
            name: 'delete_clock',
            description: 'Delete a clock from user stared list',
            props: {
                type: 'object',
                properties: {
                    timezone: {
                        type: 'string',
                        description: 'The name of timezone',
                    },
                },
                required: ['timezone'],
            },
        },
        component: lazy(() => import('@/components/DeleteClock')),
    },
];

export const system = [
    'This is a world clock app, user can choose different timezones and get real time clocks.',
];
