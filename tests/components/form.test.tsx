import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Form', () => {
    it('should render form', () => {
        render(<form>Formulár</form>);
        expect(screen.getByText('Formulár')).toBeInTheDocument();
    });
});
