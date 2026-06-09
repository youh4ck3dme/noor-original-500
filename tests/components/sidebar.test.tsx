import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Sidebar', () => {
    it('should render sidebar', () => {
        render(<aside>Bočný panel</aside>);
        expect(screen.getByText('Bočný panel')).toBeInTheDocument();
    });
});
