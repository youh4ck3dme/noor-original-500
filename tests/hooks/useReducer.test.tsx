import { renderHook } from '@testing-library/react';
import { useReducer } from 'react';

describe('useReducer', () => {
  it('should use reducer', () => {
    const reducer = (state: any, action: any) => {
      switch (action.type) {
        case 'increment':
          return { count: state.count + 1 };
        default:
          return state;
      }
    };
    const { result } = renderHook(() => useReducer(reducer, { count: 0 }));
    expect(result.current[0].count).toBe(0);
  });
});
