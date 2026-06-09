import React from 'react';
import { render, screen } from '@testing-library/react';

describe('List', () => {
    it('should render list', () => {
        render(<ul><li>Položka</li></ul>);
        expect(screen.getByText('Položka')).toBeInTheDocument();
    });
});
