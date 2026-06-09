import { slugify } from './slugify';

describe('slugify', () => {
    it('should slugify a string', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });
});
