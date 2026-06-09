import { getAverage } from './getAverage';

describe('getAverage', () => {
    it('should return the average of an array of numbers', () => {
        expect(getAverage([1, 2, 3])).toBe(2);
    });
});
