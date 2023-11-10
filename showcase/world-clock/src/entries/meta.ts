import {ComponentModuleInfo} from '@deep-grasp/core';
import {ComponentType} from 'react';

function named<N extends string>(name: N) {
    return (module: Record<N, ComponentType<any>>) => module[name];
}

// TODO: These should be generated from a compiler
export const components: ComponentModuleInfo[] = [
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
        load: () => import('@/components/Clock').then(named('default')),
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
        load: () => import('@/components/AddClock').then(named('AddClockForm')),
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
        load: () => import('@/components/DeleteClock').then(named('default')),
    },
];

export const system = [
    'This is a world clock app, user can choose different timezones and get real time clocks.',
];
