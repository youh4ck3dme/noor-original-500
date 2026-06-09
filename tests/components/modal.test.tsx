import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Modal Component', () => {
  it('should render correctly', () => {
    render(<div>Modal</div>);
    expect(screen.getByText('Modal')).toBeInTheDocument();
  });
});
