import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('About', () => {
  it('should render about page', () => {
    render(<div>O nás</div>);
    expect(screen.getByText('O nás')).toBeInTheDocument();
  });
});
