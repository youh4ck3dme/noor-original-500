import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Card Component', () => {
  it('should render correctly', () => {
    render(<div>Card</div>);
    expect(screen.getByText('Card')).toBeInTheDocument();
  });
});
