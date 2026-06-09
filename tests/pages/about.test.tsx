import React from 'react';
import { render, screen } from '@testing-library/react';

describe('About', () => {
    it('should render about page', () => {
        render(<div>O nás</div>);
        expect(screen.getByText('O nás')).toBeInTheDocument();
    });
});
