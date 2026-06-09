import { useMeasure } from './useMeasure';
import { renderHook, act } from '@testing-library/react-hooks';

describe('useMeasure', () => {
    it('should return the dimensions of the element', () => {
        const { result } = renderHook(() => useMeasure());
        const [ref, { width }] = result.current;
        const element = document.createElement('div');
        Object.defineProperty(element, 'offsetWidth', { value: 100 });
        ref(element);
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(result.current[1].width).toBe(100);
    });
});
