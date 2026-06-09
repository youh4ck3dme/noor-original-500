import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

describe('useFetch', () => {
    it('should fetch data', async () => {
        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ data: 'test' }),
            })
        );

        const { result, waitForNextUpdate } = renderHook(() => useFetch('https://api.test'));

        function useFetch(url) {
            const [data, setData] = React.useState(null);
            React.useEffect(() => {
                fetch(url)
                    .then(res => res.json())
                    .then(setData);
            }, [url]);
            return data;
        }

        await waitForNextUpdate();

        expect(result.current).toEqual({ data: 'test' });
    });
});
