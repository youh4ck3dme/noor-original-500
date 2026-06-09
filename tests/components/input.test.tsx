import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Input Component', () => {
  it('should render correctly', () => {
    render(<input type="text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
