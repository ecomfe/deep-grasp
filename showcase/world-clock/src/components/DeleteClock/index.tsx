import {Modal} from 'antd';
import {useCallback} from 'react';
import {graspable} from '@deep-grasp/react';
import {useDeleteStar, useStarList} from '@/atoms/star';

interface Props {
    timezone: string;
}

function DeleteClock({timezone}: Props) {
    const stars = useStarList();
    const deleteStar = useDeleteStar();
    const deleteCurrentTimezoneFromStar = useCallback(
        () => {
            deleteStar(timezone);
        },
        [deleteStar, timezone]
    );

    if (stars.includes(timezone)) {
        return (
            <Modal open title="Delete Clock" onOk={deleteCurrentTimezoneFromStar}>
                <p>
                    Are you sure to delete the clock <strong>{timezone}</strong>?
                </p>
            </Modal>
        );
    }

    // This is actually for AI generated props, we'll never get a unexpected timezone in common case.
    return (
        <span>
            Clock <strong>{timezone}</strong> is not stared.
        </span>
    );
}

export default graspable(DeleteClock, 'Delete a clock from user stared list');
