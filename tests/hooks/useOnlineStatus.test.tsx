import { renderHook } from '@testing-library/react-hooks';

describe('useOnlineStatus', () => {
    it('should be online', () => {
        const { result } = renderHook(() => navigator.onLine);
        expect(result.current).toBe(true);
    });
});
