import { nasobenie } from '@/utils/nasobenie.ts';
describe('nasobenie function', () => {
    it('should correctly multiply two numbers', () => {
        expect(nasobenie(3, 4)).toBe(12);
    });
});
