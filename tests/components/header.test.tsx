import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Header Component', () => {
  it('should render correctly', () => {
    render(<header>Header</header>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });
});
