import { Bot } from 'gramio';
import type { Update, Message } from 'gramio';
import { log } from './logger';

interface MessageData {
  message: Message;
  senderId: number;
}

export const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET;
export const ALLOWED_TELEGRAM_IDS = process.env.ALLOWED_TELEGRAM_IDS?.split(',').map(id => parseInt(id.trim(), 10)) || [];
export const ADMIN_TELEGRAM_ALIAS = process.env.ADMIN_TELEGRAM_ALIAS;
export const FORWARD_CHANNEL_ID = process.env.FORWARD_CHANNEL_ID;
export const BOT_TOKEN = process.env.BOT_TOKEN;

export const bot = BOT_TOKEN ? new Bot(BOT_TOKEN) : null;

export function validateConfig(): { isValid: boolean; error?: string } {
  if (!TELEGRAM_SECRET || !ADMIN_TELEGRAM_ALIAS || !FORWARD_CHANNEL_ID || !BOT_TOKEN || !bot) {
    log.error('Missing required environment variables', { 
      hasSecret: !!TELEGRAM_SECRET,
      hasAdmin: !!ADMIN_TELEGRAM_ALIAS,
      hasChannel: !!FORWARD_CHANNEL_ID,
      hasToken: !!BOT_TOKEN,
      hasBot: !!bot
    });
    return { isValid: false, error: 'Internal Server Error' };
  }
  return { isValid: true };
}

export function validateSecret(requestSecret: string | null): { isValid: boolean; error?: string } {
  if (requestSecret !== TELEGRAM_SECRET) {
    log.warn('Invalid secret token', { hasSecret: !!requestSecret });
    return { isValid: false, error: 'Unauthorized' };
  }
  return { isValid: true };
}

export function validateMessage(update: Update): { isValid: boolean; data?: MessageData; error?: string } {
  if (!update.message) {
    log.info('Non-message update received, ignoring');
    return { isValid: false, error: 'Non-message update' };
  }

  const senderId = update.message.from?.id;
  if (!senderId) {
    log.warn('Invalid message structure - missing sender ID', { message: update.message });
    return { isValid: false, error: 'Invalid message structure' };
  }

  return { isValid: true, data: { message: update.message, senderId } };
}

export function isAuthorized(senderId: number): boolean {
  return ALLOWED_TELEGRAM_IDS.includes(senderId);
}

export function getMessageType(message: Message): string {
  return message.video ? 'video' : 
         message.audio ? 'audio' : 
         message.photo ? 'photo' : 
         'unsupported';
}

export async function sendUnauthorizedMessage(senderId: number, requestId: string): Promise<void> {
  log.warn('Unauthorized sender', { requestId, senderId, allowedIds: ALLOWED_TELEGRAM_IDS });
  try {
    await bot!.api.sendMessage({
      chat_id: senderId,
      text: `You are not allowed to access this time vault, please ask @${ADMIN_TELEGRAM_ALIAS} to add you.`,
    });
  } catch (error) {
    log.error('Failed to send unauthorized message', { requestId, senderId, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function sendUnsupportedMessageType(senderId: number, requestId: string, messageType: string): Promise<void> {
  log.info('Unsupported message type received', { requestId, senderId, messageType });
  try {
    await bot!.api.sendMessage({
      chat_id: senderId,
      text: 'Only video, audio, and photo messages are supported.',
    });
  } catch (error) {
    log.error('Failed to send unsupported message type response', { requestId, senderId, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function forwardMessage(message: Message, requestId: string, senderId: number, messageType: string): Promise<{ success: boolean; error?: string }> {
  try {
    log.info('Forwarding message to channel', { requestId, senderId, messageType, channelId: FORWARD_CHANNEL_ID });
    
    const forwardResult = await bot!.api.forwardMessage({
      chat_id: FORWARD_CHANNEL_ID!,
      from_chat_id: message.chat.id,
      message_id: message.id,
    });

    // Add reaction to confirm successful forwarding
    try {
      await bot!.api.setMessageReaction({
        chat_id: message.chat.id,
        message_id: message.id,
        reaction: [{ type: 'emoji', emoji: '👍' }]
      });
    } catch (reactionError) {
      log.warn('Failed to add reaction to original message', { 
        requestId, 
        senderId, 
        error: reactionError instanceof Error ? reactionError.message : 'Unknown error' 
      });
    }

    log.info('Message forwarded successfully', { 
      requestId, 
      senderId, 
      messageType, 
      forwardedMessageId: forwardResult.message_id 
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error forwarding message', { requestId, senderId, messageType, error: errorMessage });
    
    try {
      await bot!.api.sendMessage({
        chat_id: senderId,
        text: 'Sorry, there was an error forwarding your message. Please try again later.',
      });
    } catch (sendError) {
      log.error('Failed to send error message to user', { requestId, senderId, error: sendError instanceof Error ? sendError.message : 'Unknown error' });
    }
    
    return { success: false, error: 'Failed to forward message' };
  }
}
