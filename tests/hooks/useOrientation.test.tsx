import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

describe('useOrientation', () => {
    it('should return orientation', () => {
        const { result } = renderHook(() => {
            const [orientation, setOrientation] = React.useState(window.screen.orientation.type);
            return orientation;
        });

        expect(result.current).toBe('vertical-primary');
    });
});
