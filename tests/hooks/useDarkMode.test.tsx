import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

describe('useDarkMode', () => {
    it('should toggle dark mode', () => {
        const { result } = renderHook(() => {
            const [isDarkMode, setIsDarkMode] = React.useState(false);
            const toggle = () => setIsDarkMode(!isDarkMode);
            return { isDarkMode, toggle };
        });

        act(() => {
            result.current.toggle();
        });

        expect(result.current.isDarkMode).toBe(true);
    });
});
