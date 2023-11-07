import {useEffect, useState} from 'react';
import {getTimezone} from 'countries-and-timezones';
import {graspable} from '@deep-grasp/react';
import styled from '@emotion/styled';
import ReactClock from 'react-clock';
import 'react-clock/dist/Clock.css';

const Layout = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 240px;
    height: 240px;
    font-size: 20px;
    font-weight: bold;
`;

function timeAtTimezone(timezone: string) {
    const info = getTimezone(timezone);

    if (!info) {
        throw new Error(`No timezone "${timezone}" found`);
    }

    return new Date(Date.now() + info.utcOffset);
}

interface Props {
    /** The name of timezone */
    timezone: string;
}

function Clock({timezone}: Props) {
    const [time, setTime] = useState(() => timeAtTimezone(timezone));
    useEffect(
        () => {
            const interval = setInterval(() => setTime(timeAtTimezone(timezone)), 1000);

            return () => {
                clearInterval(interval);
            };
        },
        [timezone]
    );

    return (
        <Layout>
            <ReactClock size={200} value={time} />
            <div>{timezone}</div>
        </Layout>
    );
}

export default graspable(Clock, 'View clock in specified timezone');
