import { useToggle } from './useToggle';
import { renderHook, act } from '@testing-library/react-hooks';

describe('useToggle', () => {
    it('should toggle the value', () => {
        const { result } = renderHook(() => useToggle(false));
        expect(result.current[0]).toBe(false);
        act(() => {
            result.current[1]();
        });
        expect(result.current[0]).toBe(true);
    });
});
