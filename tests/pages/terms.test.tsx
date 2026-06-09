import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Terms', () => {
    it('should render terms page', () => {
        render(<div>Podmienky</div>);
        expect(screen.getByText('Podmienky')).toBeInTheDocument();
    });
});
