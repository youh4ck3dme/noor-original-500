import { delenie } from '@/utils/delenie.ts';
describe('delenie function', () => {
    it('should correctly divide two numbers', () => {
        expect(delenie(10, 2)).toBe(5);
    });
});
