import React from 'react';
import { render, screen } from '@testing-library/react';

describe('404', () => {
    it('should render 404 page', () => {
        render(<div>404</div>);
        expect(screen.getByText('404')).toBeInTheDocument();
    });
});
