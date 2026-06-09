import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Examples', () => {
    it('should render examples page', () => {
        render(<div>Ukážky</div>);
        expect(screen.getByText('Ukážky')).toBeInTheDocument();
    });
});
