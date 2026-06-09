import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Home', () => {
    it('should render home page', () => {
        render(<div>Domov</div>);
        expect(screen.getByText('Domov')).toBeInTheDocument();
    });
});
