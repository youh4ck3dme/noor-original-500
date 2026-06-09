import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Link', () => {
    it('should render link', () => {
        render(<a href="#">Odkaz</a>);
        expect(screen.getByText('Odkaz')).toBeInTheDocument();
    });
});
