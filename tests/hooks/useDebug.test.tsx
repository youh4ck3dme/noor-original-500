import { renderHook } from '@testing-library/react';
import { useDebugValue } from 'react';

describe('useDebug', () => {
  it('should use debug value', () => {
    const { result } = renderHook(() => useDebugValue('test'));
    expect(result.current).toBeUndefined();
  });
});
