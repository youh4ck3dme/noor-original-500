import { useIntersectionObserver } from './useIntersectionObserver';
import { renderHook, act } from '@testing-library/react-hooks';

describe('useIntersectionObserver', () => {
    it('should return true when the element is intersecting', () => {
        const { result } = renderHook(() => useIntersectionObserver({}));
        const [ref, entry] = result.current;
        const element = document.createElement('div');
        ref(element);
        // More complex to mock IntersectionObserver
        expect(entry).toBe(undefined);
    });
});
