import {useCallback, useState} from 'react';
import {getAllTimezones} from 'countries-and-timezones';
import {Button, Select} from 'antd';
import {graspable, useInGrasp} from '@deep-grasp/react';
import styled from '@emotion/styled';
import {useAddStar} from '@/atoms/star';

const options = Object.values(getAllTimezones()).map(v => ({label: v.name, value: v.name}));

const FormLayout = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
`;

interface FormProps {
    /** Initial selected timezone name, omit it if no initial value is provided */
    timezone?: string;
}

function Form({timezone}: FormProps) {
    const [value, setValue] = useState(timezone);
    const [finished, setFinished] = useState(false);
    const addStar = useAddStar();
    const addCurrentTimezoneToStar = useCallback(
        () => {
            if (value) {
                addStar(value);
                setFinished(true);
            }
        },
        [addStar, value]
    );
    const inGrasp = useInGrasp();

    if (inGrasp && finished) {
        return (
            <span>
                Clock <strong>{timezone}</strong> added to your list
            </span>
        );
    }

    return (
        <FormLayout>
            <Select
                style={{width: '100%'}}
                options={options}
                placeholder="Choose a timezone"
                value={value}
                onChange={setValue}
            />
            <Button type="primary" size="large" onClick={addCurrentTimezoneToStar}>Star It</Button>
        </FormLayout>
    );
}

export const AddClockForm = graspable(Form, 'Add a clock to stared list');

const Layout = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 240px;
    height: 240px;
    padding: 20px;
    background-color: #fafafa;
    border-radius: 20px;
`;

export default function AddClock() {
    return (
        <Layout>
            <Form />
        </Layout>
    );
}
