import { usePrevious } from './usePrevious';
import { renderHook } from '@testing-library/react-hooks';

describe('usePrevious', () => {
    it('should return the previous value', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 0 },
        });
        expect(result.current).toBe(undefined);
        rerender({ value: 1 });
        expect(result.current).toBe(0);
    });
});
