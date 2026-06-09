import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetailPage from '../../pages/product';

describe('ProductDetailPage', () => {
    it('should render product detail page', () => {
        render(<ProductDetailPage />);
        expect(screen.getByText('Lipozomálny Vitamín C')).toBeInTheDocument();
    });
});
