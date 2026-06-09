import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Menu', () => {
    it('should render menu', () => {
        render(<ul><li>Menu</li></ul>);
        expect(screen.getByText('Menu')).toBeInTheDocument();
    });
});
