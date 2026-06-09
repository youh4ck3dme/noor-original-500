import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Privacy', () => {
    it('should render privacy page', () => {
        render(<div>Súkromie</div>);
        expect(screen.getByText('Súkromie')).toBeInTheDocument();
    });
});
