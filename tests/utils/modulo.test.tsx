import { modulo } from '@/utils/modulo.ts';
describe('modulo function', () => {
    it('should correctly find the remainder of a division', () => {
        expect(modulo(10, 3)).toBe(1);
    });
});
