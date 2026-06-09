import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

describe('useSessionStorage', () => {
    it('should use session storage', () => {
        const { result } = renderHook(() => {
            const [value, setValue] = React.useState(sessionStorage.getItem('test'));
            return { value, setValue };
        });

        act(() => {
            result.current.setValue('test-value');
        });

        expect(sessionStorage.getItem('test')).toBe(null);
    });
});
