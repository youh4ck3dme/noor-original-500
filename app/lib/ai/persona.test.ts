import { describe, expect, it } from 'vitest';
import { DEFAULT_SUGGESTED_REPLIES, PHARMACIST_PERSONA } from './persona';

describe('persona', () => {
  it('defines Slovak pharmacist persona with safety guidance', () => {
    expect(PHARMACIST_PERSONA).toContain('virtuálny farmaceut GrowMedica');
    expect(PHARMACIST_PERSONA).toContain('po slovensky');
    expect(PHARMACIST_PERSONA).toContain('Nediagnostikuj');
  });

  it('exposes default suggested replies for the chat widget', () => {
    expect(DEFAULT_SUGGESTED_REPLIES).toHaveLength(3);
    expect(DEFAULT_SUGGESTED_REPLIES[0]).toContain('spánok');
  });
});
