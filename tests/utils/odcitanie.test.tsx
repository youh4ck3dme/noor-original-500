import { odcitanie } from '@/utils/odcitanie.ts';
describe('odcitanie function', () => {
    it('should correctly subtract two numbers', () => {
        expect(odcitanie(5, 2)).toBe(3);
    });
});
