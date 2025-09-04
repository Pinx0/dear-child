import { describe, it, expect, beforeEach, vi } from 'vitest';
import { translate } from '../../translations';

// Mock environment variables
const mockEnv = vi.hoisted(() => ({
  LANGUAGE: 'en-US',
}));

// Mock process.env
Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true,
});

describe('Translation System', () => {
  beforeEach(() => {
    // Reset environment to default
    mockEnv.LANGUAGE = 'en-US';
  });

  describe('Basic Translation', () => {
    it('should translate English keys correctly', () => {
      expect(translate('unauthorized')).toBe('You are not allowed to access this time vault, please ask @{adminAlias} to add you. Your ID is: {senderId}');
      expect(translate('unsupportedMessageType')).toBe('Only video, audio, photo, video note, and voice messages are supported.');
      expect(translate('commands.id')).toBe('Group ID: `{groupId}`\nYour ID: `{senderId}`');
      expect(translate('commands.help')).toContain('Dear Child - Memory Time Vault');
    });

    it('should translate Spanish keys correctly when language is set to es-ES', () => {
      mockEnv.LANGUAGE = 'es-ES';
      
      expect(translate('unauthorized')).toBe('No tienes permitido acceder a esta cápsula del tiempo, por favor pide a @{adminAlias} que te agregue. Tu ID es: {senderId}');
      expect(translate('unsupportedMessageType')).toBe('Solo se admiten videos, audios, fotos, notas de video y mensajes de voz.');
      expect(translate('commands.id')).toBe('ID del Grupo: `{groupId}`\nTu ID: `{senderId}`');
      expect(translate('commands.help')).toContain('Dear Child - Cápsula del Tiempo');
    });
  });

  describe('Placeholder Replacement', () => {
    it('should replace placeholders with provided values', () => {
      const result = translate('unauthorized', {
        adminAlias: 'testadmin',
        senderId: 123456789
      });
      
      expect(result).toBe('You are not allowed to access this time vault, please ask @testadmin to add you. Your ID is: 123456789');
    });

    it('should replace placeholders in command responses', () => {
      const groupId = -1001234567890;
      const senderId = 987654321;
      
      const result = translate('commands.id', { groupId, senderId });
      
      expect(result).toBe('Group ID: `-1001234567890`\nYour ID: `987654321`');
    });

    it('should handle multiple placeholders in one string', () => {
      const result = translate('unauthorized', {
        adminAlias: 'admin123',
        senderId: 999888777
      });
      
      expect(result).toContain('@admin123');
      expect(result).toContain('999888777');
    });

    it('should handle numeric replacements', () => {
      const result = translate('commands.id', { groupId: 12345, senderId: 67890 });
      expect(result).toBe('Group ID: `12345`\nYour ID: `67890`');
    });

    it('should not replace placeholders that are not provided', () => {
      const result = translate('unauthorized', { adminAlias: 'testadmin' });
      expect(result).toContain('{senderId}');
      expect(result).not.toContain('{adminAlias}');
    });
  });

  describe('Language Fallback', () => {
    it('should fallback to English when unsupported language is provided', () => {
      mockEnv.LANGUAGE = 'invalid-lang';
      
      expect(translate('unauthorized')).toBe('You are not allowed to access this time vault, please ask @{adminAlias} to add you. Your ID is: {senderId}');
    });

    it('should fallback to English when language is undefined', () => {
      mockEnv.LANGUAGE = undefined as unknown as string;
      
      expect(translate('unauthorized')).toBe('You are not allowed to access this time vault, please ask @{adminAlias} to add you. Your ID is: {senderId}');
    });

    it('should fallback to English when language is empty string', () => {
      mockEnv.LANGUAGE = '';
      
      expect(translate('unauthorized')).toBe('You are not allowed to access this time vault, please ask @{adminAlias} to add you. Your ID is: {senderId}');
    });
  });

  describe('Invalid Keys', () => {
    it('should return the key itself when translation is not found', () => {
      const invalidKey = 'nonexistent.key' as never;
      expect(translate(invalidKey)).toBe('nonexistent.key');
    });

    it('should handle empty key gracefully', () => {
      expect(translate('' as never)).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty replacements object', () => {
      const result = translate('unauthorized', {});
      expect(result).toBe('You are not allowed to access this time vault, please ask @{adminAlias} to add you. Your ID is: {senderId}');
    });

    it('should handle special characters in replacements', () => {
      const result = translate('commands.id', { groupId: '@special!@#$%', senderId: 123 });
      expect(result).toBe('Group ID: `@special!@#$%`\nYour ID: `123`');
    });

    it('should handle very long replacement values', () => {
      const longValue = 'a'.repeat(1000);
      const result = translate('commands.id', { groupId: longValue, senderId: 123 });
      expect(result).toBe(`Group ID: \`${longValue}\`\nYour ID: \`123\``);
    });
  });

  describe('Type Safety', () => {
    it('should accept valid translation keys', () => {
      // These should compile without TypeScript errors
      expect(() => translate('unauthorized')).not.toThrow();
      expect(() => translate('unsupportedMessageType')).not.toThrow();
      expect(() => translate('commands.id')).not.toThrow();
      expect(() => translate('commands.help')).not.toThrow();
    });
  });
});
