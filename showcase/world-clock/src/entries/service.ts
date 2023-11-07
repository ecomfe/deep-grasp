import {ServiceInput, ServiceOutput, adaptServiceInputToModel} from '@deep-grasp/core';

export async function invokeService(input: ServiceInput): Promise<ServiceOutput> {
    const payload = adaptServiceInputToModel(input);
    const response = await fetch(
        '/api/chat',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }
    );
    return response.json();
}
