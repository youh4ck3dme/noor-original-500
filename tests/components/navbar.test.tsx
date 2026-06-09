import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Navbar', () => {
    it('should render navbar', () => {
        render(<nav>Navigácia</nav>);
        expect(screen.getByText('Navigácia')).toBeInTheDocument();
    });
});
