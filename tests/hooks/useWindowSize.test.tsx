import { useWindowSize } from './useWindowSize';
import { renderHook, act } from '@testing-library/react-hooks';

describe('useWindowSize', () => {
    it('should return the window size', () => {
        const { result } = renderHook(() => useWindowSize());
        expect(result.current.width).toBe(window.innerWidth);
        expect(result.current.height).toBe(window.innerHeight);
    });
});
