import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Contact', () => {
    it('should render contact page', () => {
        render(<div>Kontakt</div>);
        expect(screen.getByText('Kontakt')).toBeInTheDocument();
    });
});
