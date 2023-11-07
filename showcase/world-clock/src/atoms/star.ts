import {atom, useAtomValue, useSetAtom} from 'jotai';
import {useCallback} from 'react';

const DEFAULT_STAR_LIST = [
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Europe/London',
    'Europe/Istanbul',
    'America/New_York',
    'America/Chicago',
    'Australia/Sydney',
];

const stars = atom(DEFAULT_STAR_LIST);

export function useStarList() {
    return useAtomValue(stars);
}

export function useAddStar() {
    const setValue = useSetAtom(stars);
    const add = useCallback(
        (name: string) => {
            setValue(v => (v.includes(name) ? v : [...v, name]));
        },
        [setValue]
    );
    return add;
}

export function useDeleteStar() {
    const setValue = useSetAtom(stars);
    const remove = useCallback(
        (name: string) => {
            setValue(v => v.filter(s => s !== name));
        },
        [setValue]
    );
    return remove;
}
