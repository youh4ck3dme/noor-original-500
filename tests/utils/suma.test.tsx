import { suma } from '@/utils/suma.ts';
describe('suma function', () => {
    it('should correctly add two positive numbers', () => {
        expect(suma(2, 3)).toBe(5);
    });
});
