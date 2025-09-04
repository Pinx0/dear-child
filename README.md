# Dear Child - Memory Time Vault

A private Telegram bot that serves as a digital time vault for precious memories of a child. Parents and family members can securely send photos, videos, and audio messages to the bot, which stores them in a private channel. When the child turns 18, they receive access to this treasure trove of memories spanning their entire childhood.

## 💝 Purpose

This project creates a secure, private space where family members can capture and preserve precious moments throughout a child's life. Think of it as a digital time capsule that grows richer with each memory shared.

**The Journey:**
- **Years 0-18**: Family members send memories (photos, videos, audio, video notes, voice messages) to the bot
- **Age 18**: The child receives access to the private channel containing all their memories
- **Result**: A complete, chronological collection of their childhood from the perspective of those who love them most

## ✨ Features

- **Private & Secure**: Only whitelisted family members can send memories
- **Media-Rich**: Supports photos, videos, audio messages, video notes, and voice messages
- **Automatic Storage**: All memories are instantly saved to a private channel
- **Permanent Preservation**: Memories are copied to the channel, so they remain even if originals are deleted
- **Visual Confirmation**: Bot reacts with 👍 to confirm successful forwarding
- **Access Control**: Admin can manage who can contribute memories
- **Reliable**: Built with comprehensive error handling and monitoring

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   Copy `env.example` to `.env.local` and fill in the required values:
   ```env
   BOT_TOKEN=your_bot_token_here
   TELEGRAM_SECRET=your_webhook_secret_here
   ADMIN_TELEGRAM_ALIAS=your_admin_username
   ALLOWED_TELEGRAM_IDS=123456789,987654321,456789123
   FORWARD_CHANNEL_ID=@your_channel_username
   ```

3. **Get Bot Token**:
   - Create a new bot with [@BotFather](https://t.me/botfather)
   - Get the bot token and set it as `BOT_TOKEN`

4. **Get Channel ID**:
   - Add your bot to the target channel as an administrator
   - Use the channel username (e.g., `@your_channel`) or ID as `FORWARD_CHANNEL_ID`

5. **Set Webhook**:
   - Deploy your application
   - Set the webhook URL using the Telegram Bot API:
   ```bash
   curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{
          "url": "https://your-domain.com/api/telegram/webhook",
          "secret_token": "your_webhook_secret_here"
        }'
   ```

## 📡 API Endpoints

### **POST** `/api/telegram/webhook`
Main webhook endpoint for receiving Telegram messages.

#### Headers
- `x-telegram-bot-api-secret-token`: Secret token for validation

#### Request Body
Telegram Update object containing the message

#### Responses
- **200 OK**: Message processed successfully
- **400 Bad Request**: Invalid message structure
- **401 Unauthorized**: Invalid secret token
- **500 Internal Server Error**: Server error or missing configuration

### **GET** `/api/telegram/health`
Health check endpoint for monitoring and debugging.

#### Responses
- **200 OK**: Service is healthy (all environment variables configured)
- **503 Service Unavailable**: Service is unhealthy (missing configuration)

#### Example Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "version": "abc123def456",
  "region": "iad1",
  "config": {
    "hasSecret": true,
    "hasAdmin": true,
    "hasChannel": true,
    "hasToken": true,
    "hasWhitelist": true
  }
}
```

## 🔄 Message Flow

1. **Secret Validation**: Checks the `x-telegram-bot-api-secret-token` header
2. **User Validation**: Verifies sender is in the whitelist
3. **Message Type Check**: Only processes video, audio, photo, video note, and voice messages
4. **Forwarding**: Forwards supported messages to the specified channel
5. **Error Responses**: Sends appropriate messages to unauthorized users or for unsupported message types

## 📸 Supported Message Types

- ✅ Video messages
- ✅ Audio messages  
- ✅ Photo messages
- ✅ Video notes (circular videos)
- ✅ Voice messages
- ❌ Text messages
- ❌ Documents
- ❌ Other message types

## 💬 User Messages

- **Unauthorized User**: "You are not allowed to access this time vault, please ask @{admin} to add you."
- **Unsupported Message Type**: "Only video, audio, photo, video note, and voice messages are supported."
- **Forwarding Error**: "Sorry, there was an error forwarding your message. Please try again later."

## 🔍 Observability & Debugging

### Enhanced Logging
The webhook includes comprehensive logging for debugging on Vercel:

- **Request Tracking**: Each request gets a unique `requestId` for tracing
- **Structured Logging**: All logs include timestamps and structured data
- **Log Levels**: INFO, WARN, ERROR, and DEBUG (development only)
- **Contextual Data**: Logs include sender IDs, message types, and error details

### Log Examples
```
[INFO] 2024-01-15T10:30:00.000Z - Webhook request started {"requestId":"abc123","url":"https://your-app.vercel.app/api/telegram/webhook"}
[INFO] 2024-01-15T10:30:00.100Z - Processing message {"requestId":"abc123","senderId":123456789,"messageType":"video","chatId":-1001234567890}
[INFO] 2024-01-15T10:30:00.200Z - Message forwarded successfully {"requestId":"abc123","senderId":123456789,"messageType":"video"}
```

### Monitoring
- **Health Check**: Use `/api/telegram/health` to monitor service status
- **Vercel Logs**: View logs in Vercel dashboard under Functions tab
- **Error Tracking**: All errors are logged with full context and stack traces

### Debugging Tips
1. Check the health endpoint to verify configuration
2. Look for request IDs in logs to trace specific requests
3. Monitor for unauthorized access attempts
4. Check forwarding errors for channel permission issues

## 🔒 Message Preservation

**What happens if someone deletes their original message?**
- ✅ **Memories are preserved**: The forwarded message in the channel remains intact
- ✅ **Independent copies**: Forwarded messages become independent of the original
- ✅ **Perfect for time vaults**: This ensures memories are never lost, even if originals are deleted
- ✅ **Visual confirmation**: The bot reacts with 👍 to confirm successful forwarding

This behavior is ideal for a time vault - memories are permanently preserved regardless of what happens to the original messages.

## 🎁 The Gift of Memories

This project is designed to create something truly special - a comprehensive collection of a child's life from the perspective of those who love them. Every photo, video, audio message, video note, and voice message becomes part of a story that will be treasured for a lifetime.

When the child turns 18, they'll discover not just memories, but the love, care, and attention that went into preserving every precious moment of their journey - from photos and videos to voice messages and video notes capturing their growth and milestones.