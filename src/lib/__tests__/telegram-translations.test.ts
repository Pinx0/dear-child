import { describe, it, expect, beforeEach, vi } from 'vitest';
import { translate } from '../translations';

const mockSendMessage = vi.fn();
const mockBot = {
  api: {
    sendMessage: mockSendMessage,
  },
};

vi.mock('../telegram', () => ({
  bot: mockBot,
  ADMIN_TELEGRAM_ALIAS: 'testadmin',
}));

describe('Telegram Translation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.LANGUAGE = 'en-US';
  });

  const mockEnv = vi.hoisted(() => ({
    LANGUAGE: 'en-US',
  }));

  Object.defineProperty(process, 'env', {
    value: mockEnv,
    writable: true,
  });

  describe('Unauthorized Message Translation', () => {
    it('should translate unauthorized message in English', () => {
      const result = translate('unauthorized', {
        adminAlias: 'testadmin',
        senderId: 123456789
      });

      expect(result).toBe('You are not allowed to access this time vault, please ask @testadmin to add you. Your ID is: 123456789');
    });

    it('should translate unauthorized message in Spanish', () => {
      mockEnv.LANGUAGE = 'es-ES';
      
      const result = translate('unauthorized', {
        adminAlias: 'testadmin',
        senderId: 123456789
      });

      expect(result).toBe('No tienes permitido acceder a esta cápsula del tiempo, por favor pide a @testadmin que te agregue. Tu ID es: 123456789');
    });
  });

  describe('Unsupported Message Type Translation', () => {
    it('should translate unsupported message type in English', () => {
      const result = translate('unsupportedMessageType');
      expect(result).toBe('Only video, audio, photo, video note, and voice messages are supported.');
    });

    it('should translate unsupported message type in Spanish', () => {
      mockEnv.LANGUAGE = 'es-ES';
      
      const result = translate('unsupportedMessageType');
      expect(result).toBe('Solo se admiten videos, audios, fotos, notas de video y mensajes de voz.');
    });
  });

  describe('Command Response Translation', () => {
    it('should translate ID command responses in English', () => {
      const groupId = -1001234567890;
      const senderId = 987654321;

      const groupResult = translate('commands.id.groupId', { groupId });
      const userResult = translate('commands.id.yourId', { senderId });

      expect(groupResult).toBe('Group ID: `-1001234567890`');
      expect(userResult).toBe('Your ID: `987654321`');
    });

    it('should translate ID command responses in Spanish', () => {
      mockEnv.LANGUAGE = 'es-ES';
      
      const groupId = -1001234567890;
      const senderId = 987654321;

      const groupResult = translate('commands.id.groupId', { groupId });
      const userResult = translate('commands.id.yourId', { senderId });

      expect(groupResult).toBe('ID del Grupo: `-1001234567890`');
      expect(userResult).toBe('Tu ID: `987654321`');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical unauthorized scenario', () => {
      const adminAlias = 'dearchild_admin';
      const senderId = 555666777;

      const result = translate('unauthorized', { adminAlias, senderId });
      
      expect(result).toContain('@dearchild_admin');
      expect(result).toContain('555666777');
      expect(result).toContain('time vault');
    });

    it('should handle typical command scenario', () => {
      const groupId = -1001987654321;
      const senderId = 111222333;

      const groupResult = translate('commands.id.groupId', { groupId });
      const userResult = translate('commands.id.yourId', { senderId });

      expect(groupResult).toContain('-1001987654321');
      expect(userResult).toContain('111222333');
    });

    it('should handle language switching mid-session', () => {
      let result = translate('unauthorized', { adminAlias: 'admin', senderId: 123 });
      expect(result).toContain('You are not allowed');
    
      mockEnv.LANGUAGE = 'es-ES';
      result = translate('unauthorized', { adminAlias: 'admin', senderId: 123 });
      expect(result).toContain('No tienes permitido');

      mockEnv.LANGUAGE = 'en-US';
      result = translate('unauthorized', { adminAlias: 'admin', senderId: 123 });
      expect(result).toContain('You are not allowed');
    });
  });
});
