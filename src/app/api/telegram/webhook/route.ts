import { NextRequest, NextResponse } from 'next/server';
import type { Update, Message } from 'gramio';
import { log } from '@/lib/logger';
import {
  validateConfig,
  validateSecret,
  validateMessage,
  isAuthorized,
  getMessageType,
  sendUnauthorizedMessage,
  sendUnsupportedMessageType,
  forwardMessage,
  isCommand,
  handleCommand
} from '@/lib/telegram';


export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  log.info(`Webhook request started`, { requestId, url: request.url });

  try {
    const validationError = await validateRequest(request);
    if (validationError) {
      return validationError;
    }

    const update: Update = await request.json();
    const messageResult = await processMessage(update, requestId);
    if (messageResult instanceof NextResponse) {
      return messageResult;
    }

    const { message, senderId } = messageResult;
    
    // Handle commands first (no authorization required for basic commands)
    if (isCommand(message)) {
      const commandResult = await handleCommand(message, requestId, senderId);
      if (commandResult.handled) {
        return NextResponse.json({ success: true });
      }
    }

    const authResponse = await handleAuthorization(senderId, requestId);
    if (authResponse) {
      return authResponse;
    }

    const messageTypeResult = await handleMessageType(message, senderId, requestId);
    if (messageTypeResult instanceof NextResponse) {
      return messageTypeResult;
    }

    return await handleForwarding(messageTypeResult, senderId, requestId);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    log.error('Unexpected error processing webhook', { requestId, error: errorMessage, stack: errorStack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


async function validateRequest(request: NextRequest): Promise<NextResponse | null> {
  const configValidation = validateConfig();
  if (!configValidation.isValid) {
    return NextResponse.json({ error: configValidation.error }, { status: 500 });
  }

  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  const secretValidation = validateSecret(secret);
  if (!secretValidation.isValid) {
    return NextResponse.json({ error: secretValidation.error }, { status: 401 });
  }

  return null;
}

async function processMessage(update: Update, requestId: string): Promise<NextResponse | { message: Message; senderId: number }> {
  log.debug('Received update', { requestId, updateType: update.message ? 'message' : 'other' });

  const messageValidation = validateMessage(update);
  if (!messageValidation.isValid) {
    if (messageValidation.error === 'Non-message update') {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: messageValidation.error }, { status: 400 });
  }

  const { message, senderId } = messageValidation.data!;
  log.info('Processing message', { 
    requestId, 
    senderId, 
    messageType: getMessageType(message),
    chatId: message.chat.id,
    messageId: message.id
  });

  return { message, senderId };
}

async function handleAuthorization(senderId: number, requestId: string): Promise<NextResponse | null> {
  if (!isAuthorized(senderId)) {
    await sendUnauthorizedMessage(senderId, requestId);
    return NextResponse.json({ success: true });
  }
  return null;
}

async function handleMessageType(message: Message, senderId: number, requestId: string): Promise<NextResponse | Message> {
  const messageType = getMessageType(message);
  if (messageType === 'unsupported') {
    await sendUnsupportedMessageType(senderId, requestId, messageType);
    return NextResponse.json({ success: true });
  }
  return message;
}

async function handleForwarding(message: Message, senderId: number, requestId: string): Promise<NextResponse> {
  const messageType = getMessageType(message);
  const forwardResult = await forwardMessage(message, requestId, senderId, messageType);
  if (!forwardResult.success) {
    return NextResponse.json({ error: forwardResult.error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}