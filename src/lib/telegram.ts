import { Bot, Update, Message } from 'gramio';
import type { TelegramReactionTypeEmojiEmoji } from 'gramio';
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

  const message = new Message(update.message.payload);
  
  const senderId = message.from?.id;
  if (!senderId) {
    log.warn('Invalid message structure - missing sender ID', { message: message.payload });
    return { isValid: false, error: 'Invalid message structure' };
  }

  return { isValid: true, data: { message, senderId } };
}

export function isAuthorized(senderId: number): boolean {
  return ALLOWED_TELEGRAM_IDS.includes(senderId);
}

export function getMessageType(message: Message): string {
  return message.video ? 'video' : 
         message.audio ? 'audio' : 
         message.photo ? 'photo' : 
         message.videoNote ? 'video_note' :
         message.voice ? 'voice' :
         'unsupported';
}

export async function sendUnauthorizedMessage(senderId: number, requestId: string): Promise<void> {
  log.warn('Unauthorized sender', { requestId, senderId, allowedIds: ALLOWED_TELEGRAM_IDS });
  try {
    await bot!.api.sendMessage({
      chat_id: senderId,
      text: `You are not allowed to access this time vault, please ask @${ADMIN_TELEGRAM_ALIAS} to add you. Your ID is: ${senderId}`,
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
      text: 'Only video, audio, photo, video note, and voice messages are supported.',
    });
  } catch (error) {
    log.error('Failed to send unsupported message type response', { requestId, senderId, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function addMessageReaction(message: Message, requestId: string, senderId: number, emoji: TelegramReactionTypeEmojiEmoji = '👍'): Promise<void> {
  try {
    await bot!.api.setMessageReaction({
      chat_id: message.chat.id,
      message_id: message.id,
      reaction: [{ type: 'emoji', emoji }]
    });
  } catch (error) {
    log.warn('Failed to add reaction to message', { 
      requestId, 
      senderId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export function isCommand(message: Message): boolean {
  return !!(message.text && message.text.startsWith('/'));
}

export async function handleCommand(message: Message, requestId: string, senderId: number): Promise<{ handled: boolean; error?: string }> {
  if (!message.text) {
    return { handled: false };
  }

  const command = message.text.split(' ')[0].toLowerCase();
  
  try {
    switch (command) {
      case '/id':
        await bot!.api.sendMessage({
          chat_id: message.chat.id,
          text: `Group ID: \`${message.chat.id}\`\nYour ID: \`${senderId}\``,
          parse_mode: 'Markdown'
        });
        log.info('Sent ID information', { requestId, senderId, chatId: message.chat.id });
        return { handled: true };
      
      default:
        log.info('Unknown command received', { requestId, senderId, command });
        return { handled: false };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Failed to handle command', { requestId, senderId, command, error: errorMessage });
    return { handled: true, error: 'Failed to process command' };
  }
}

export async function forwardMessage(message: Message, requestId: string, senderId: number, messageType: string): Promise<{ success: boolean; error?: string }> {

  log.info('Forwarding message to channel', 
    { 
        requestId, 
        senderId, 
        messageType, 
        channelId: FORWARD_CHANNEL_ID,
        fromChatId: message.chat.id,
        messageId: message.id,
        chatType: message.chat.type
  });
  
  try {
   
    const forwardResult = await bot!.api.forwardMessage({
      chat_id: FORWARD_CHANNEL_ID!,
      from_chat_id: message.chat.id,
      message_id: message.id,
    });

    log.info('Message forwarded successfully', {
        requestId, 
        senderId, 
        messageType, 
        forwardedMessageId: forwardResult.message_id 
      });

    await addMessageReaction(message, requestId, senderId);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Error forwarding message', { 
      error: errorMessage,
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    // Add thumbs down reaction to indicate forwarding failure
    await addMessageReaction(message, requestId, senderId, '👎');
    
    return { success: false, error: 'Failed to forward message' };
  }
}
