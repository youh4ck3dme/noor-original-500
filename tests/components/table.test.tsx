import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Table', () => {
    it('should render table', () => {
        render(<table><thead><tr><th>Tabuľka</th></tr></thead></table>);
        expect(screen.getByText('Tabuľka')).toBeInTheDocument();
    });
});
