import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Image', () => {
    it('should render image', () => {
        render(<img alt="Obrázok" />);
        expect(screen.getByAltText('Obrázok')).toBeInTheDocument();
    });
});
