import { renderHook } from '@testing-library/react';
import { useState } from 'react';

describe('useCustomHook', () => {
  it('should work', () => {
    const { result } = renderHook(() => useState(0));
    expect(result.current[0]).toBe(0);
  });
});
