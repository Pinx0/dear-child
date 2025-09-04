import { describe, it, expect, beforeEach, vi } from 'vitest';
import { translate } from '../../translations';

const mockEnv = vi.hoisted(() => ({
  LANGUAGE: 'en-US',
}));

Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true,
});

describe('Language Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.LANGUAGE = 'en-US';
  });

  describe('Supported Languages', () => {
    it('should recognize en-US as supported language', () => {
      mockEnv.LANGUAGE = 'en-US';
      expect(translate('unauthorized')).toContain('You are not allowed');
    });

    it('should recognize es-ES as supported language', () => {
      mockEnv.LANGUAGE = 'es-ES';
      expect(translate('unauthorized')).toContain('No tienes permitido');
    });
  });

  describe('Unsupported Languages', () => {
    it('should fallback to English for unsupported language', () => {
      mockEnv.LANGUAGE = 'fr-FR';
      expect(translate('unauthorized')).toContain('You are not allowed');
    });

    it('should fallback to English for invalid language format', () => {
      mockEnv.LANGUAGE = 'invalid-format-123';
      expect(translate('unauthorized')).toContain('You are not allowed');
    });

    it('should fallback to English for null/undefined language', () => {
      mockEnv.LANGUAGE = null as unknown as string;
      expect(translate('unauthorized')).toContain('You are not allowed');
    });
  });

  describe('Environment Variable Handling', () => {
    it('should use default language when LANGUAGE env var is not set', () => {
      mockEnv.LANGUAGE = undefined as unknown as string;
      expect(translate('unauthorized')).toContain('You are not allowed');
    });

    it('should handle empty string language', () => {
      mockEnv.LANGUAGE = '';
      expect(translate('unauthorized')).toContain('You are not allowed');
    });
  });
});
