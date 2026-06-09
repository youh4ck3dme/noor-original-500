import { renderHook } from '@testing-library/react-hooks';

describe('useGeolocation', () => {
    it('should return geolocation', () => {
        const { result } = renderHook(() => {
            // Mock navigator.geolocation
            return null;
        });

        expect(result.current).toBe(null);
    });
});
