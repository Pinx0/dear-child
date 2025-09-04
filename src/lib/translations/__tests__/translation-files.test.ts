import { describe, it, expect } from 'vitest';
import { enUS } from '../en-US';
import { esES } from '../es-ES';
import type { TranslationKeys } from '../types';

describe('Translation Files', () => {
  describe('Type Safety', () => {
    it('should have all required keys in en-US', () => {
      const requiredKeys: (keyof TranslationKeys)[] = [
        'unauthorized',
        'unsupportedMessageType',
        'commands.id.groupId',
        'commands.id.yourId',
      ];

      requiredKeys.forEach(key => {
        expect(enUS).toHaveProperty(key);
        expect(typeof enUS[key]).toBe('string');
        expect(enUS[key].length).toBeGreaterThan(0);
      });
    });

    it('should have all required keys in es-ES', () => {
      const requiredKeys: (keyof TranslationKeys)[] = [
        'unauthorized',
        'unsupportedMessageType',
        'commands.id.groupId',
        'commands.id.yourId',
      ];

      requiredKeys.forEach(key => {
        expect(esES).toHaveProperty(key);
        expect(typeof esES[key]).toBe('string');
        expect(esES[key].length).toBeGreaterThan(0);
      });
    });

    it('should not have extra keys in en-US', () => {
      const expectedKeys = Object.keys(enUS).sort();
      const requiredKeys = [
        'unauthorized',
        'unsupportedMessageType',
        'commands.id.groupId',
        'commands.id.yourId',
      ].sort();

      expect(expectedKeys).toEqual(requiredKeys);
    });

    it('should not have extra keys in es-ES', () => {
      const expectedKeys = Object.keys(esES).sort();
      const requiredKeys = [
        'unauthorized',
        'unsupportedMessageType',
        'commands.id.groupId',
        'commands.id.yourId',
      ].sort();

      expect(expectedKeys).toEqual(requiredKeys);
    });
  });

  describe('Content Validation', () => {
    it('should have placeholder placeholders in unauthorized messages', () => {
      expect(enUS.unauthorized).toContain('{adminAlias}');
      expect(enUS.unauthorized).toContain('{senderId}');
      expect(esES.unauthorized).toContain('{adminAlias}');
      expect(esES.unauthorized).toContain('{senderId}');
    });

    it('should have placeholder placeholders in command responses', () => {
      expect(enUS['commands.id.groupId']).toContain('{groupId}');
      expect(enUS['commands.id.yourId']).toContain('{senderId}');
      expect(esES['commands.id.groupId']).toContain('{groupId}');
      expect(esES['commands.id.yourId']).toContain('{senderId}');
    });

    it('should have different content between languages', () => {
      expect(enUS.unauthorized).not.toBe(esES.unauthorized);
      expect(enUS.unsupportedMessageType).not.toBe(esES.unsupportedMessageType);
      expect(enUS['commands.id.groupId']).not.toBe(esES['commands.id.groupId']);
      expect(enUS['commands.id.yourId']).not.toBe(esES['commands.id.yourId']);
    });

    it('should have reasonable length for all translations', () => {
      Object.values(enUS).forEach(translation => {
        expect(translation.length).toBeGreaterThan(10);
        expect(translation.length).toBeLessThan(500);
      });

      Object.values(esES).forEach(translation => {
        expect(translation.length).toBeGreaterThan(10);
        expect(translation.length).toBeLessThan(500);
      });
    });
  });

  describe('Consistency', () => {
    it('should have same number of placeholders in both languages', () => {
      const countPlaceholders = (text: string) => (text.match(/\{[^}]+\}/g) || []).length;

      expect(countPlaceholders(enUS.unauthorized)).toBe(countPlaceholders(esES.unauthorized));
      expect(countPlaceholders(enUS['commands.id.groupId'])).toBe(countPlaceholders(esES['commands.id.groupId']));
      expect(countPlaceholders(enUS['commands.id.yourId'])).toBe(countPlaceholders(esES['commands.id.yourId']));
    });

    it('should have same placeholder names in both languages', () => {
      const extractPlaceholders = (text: string) => (text.match(/\{([^}]+)\}/g) || []).map(m => m.slice(1, -1)).sort();

      expect(extractPlaceholders(enUS.unauthorized)).toEqual(extractPlaceholders(esES.unauthorized));
      expect(extractPlaceholders(enUS['commands.id.groupId'])).toEqual(extractPlaceholders(esES['commands.id.groupId']));
      expect(extractPlaceholders(enUS['commands.id.yourId'])).toEqual(extractPlaceholders(esES['commands.id.yourId']));
    });
  });
});
