import { NextResponse } from 'next/server';
import { TELEGRAM_SECRET, ADMIN_TELEGRAM_ALIAS, FORWARD_CHANNEL_ID, BOT_TOKEN, ALLOWED_TELEGRAM_IDS } from '@/lib/telegram';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    config: {
      hasSecret: !!TELEGRAM_SECRET,
      hasAdmin: !!ADMIN_TELEGRAM_ALIAS,
      hasChannel: !!FORWARD_CHANNEL_ID,
      hasToken: !!BOT_TOKEN,
      hasWhitelist: ALLOWED_TELEGRAM_IDS.length > 0,
    }
  };

  const isHealthy = Object.values(health.config).every(Boolean);
  
  return NextResponse.json({
    ...health,
    status: isHealthy ? 'healthy' : 'unhealthy'
  }, { 
    status: isHealthy ? 200 : 503 
  });
}
