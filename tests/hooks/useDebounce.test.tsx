import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

describe('useDebounce', () => {
    it('should debounce value', () => {
        const { result } = renderHook(() => {
            const [value, setValue] = React.useState('');
            const debouncedValue = useDebounce(value, 500);
            return { value, setValue, debouncedValue };
        });

        function useDebounce(value, delay) {
            const [debouncedValue, setDebouncedValue] = React.useState(value);
            React.useEffect(() => {
                const handler = setTimeout(() => {
                    setDebouncedValue(value);
                }, delay);
                return () => {
                    clearTimeout(handler);
                };
            }, [value, delay]);
            return debouncedValue;
        }

        act(() => {
            result.current.setValue('test');
        });

        expect(result.current.debouncedValue).toBe('');
    });
});
