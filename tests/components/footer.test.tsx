import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Footer', () => {
    it('should render footer', () => {
        render(<footer>Stopka</footer>);
        expect(screen.getByText('Stopka')).toBeInTheDocument();
    });
});
