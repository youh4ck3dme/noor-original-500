import { useHover } from './useHover';
import { renderHook, act } from '@testing-library/react-hooks';

describe('useHover', () => {
    it('should return true when the element is hovered', () => {
        const { result } = renderHook(() => useHover());
        const [ref, isHovered] = result.current;
        const element = document.createElement('div');
        ref(element);
        act(() => {
            element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        });
        expect(result.current[1]).toBe(true);
    });
});
