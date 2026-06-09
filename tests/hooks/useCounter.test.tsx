import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

describe('useCounter', () => {
    it('should increment counter', () => {
        const { result } = renderHook(() => {
            const [count, setCount] = React.useState(0);
            const increment = () => setCount(count + 1);
            return { count, increment };
        });

        act(() => {
            result.current.increment();
        });

        expect(result.current.count).toBe(1);
    });
});
