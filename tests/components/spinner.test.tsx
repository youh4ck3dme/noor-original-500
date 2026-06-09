import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Spinner', () => {
    it('should render spinner', () => {
        render(<div role="status">Spinner</div>);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
