import { renderHook } from '@testing-library/react';
import { useEffect } from 'react';

describe('useEffect', () => {
  it('should run effect', () => {
    let value = 0;
    renderHook(() => useEffect(() => { value = 1; }));
    expect(value).toBe(1);
  });
});
