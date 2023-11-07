import {getAllTimezones} from 'countries-and-timezones';
import styled from '@emotion/styled';
import {useGraspContextData} from '@deep-grasp/react';
import {useStarList} from '@/atoms/star';
import Clock from '../Clock';
import ChatPanel from '../ChatPanel';
import AddClock from '../AddClock';

const timezoneNames = Object.values(getAllTimezones()).map(v => v.name);

const Grid = styled.div`
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
    gap: 40px;
    padding: 20px;
    height: min-content;
    max-height: 100%;
    overflow: auto;
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: 1fr 400px;
    height: 100vh;
    margin: 0 auto;
`;

export default function App() {
    useGraspContextData('Once we need a timezone name, select one from here', timezoneNames);
    const stars = useStarList();

    return (
        <Layout>
            <Grid>
                {stars.map(v => <Clock key={v} timezone={v} />)}
                <AddClock />
            </Grid>
            <ChatPanel />
        </Layout>
    );
}
