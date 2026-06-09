import { renderHook, act } from '@testing-library/react-hooks';

describe('useLocalStorage', () => {
    it('should use local storage', () => {
        const { result } = renderHook(() => {
            const [value, setValue] = React.useState(localStorage.getItem('test'));
            return { value, setValue };
        });

        act(() => {
            result.current.setValue('test-value');
        });

        expect(localStorage.getItem('test')).toBe(null);
    });
});
