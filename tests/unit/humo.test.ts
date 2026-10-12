import { describe, expect, it } from 'vitest';
import app from '../../content/config/app.json';

describe('configuración', () => {
  it('usa el nombre mateAventuras', () => {
    expect(app.nombre).toBe('mateAventuras');
  });
});
