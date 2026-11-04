import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/turso';
import { sendContactNotification } from '@/lib/email/mailer';

// In-memory rate limiting map
const ipRateMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const now = Date.now();
    const rateData = ipRateMap.get(ip);

    if (rateData && now < rateData.resetTime) {
      if (rateData.count >= 5) {
        return NextResponse.json(
          { error: 'Rate limit reached. Please wait a few minutes before transmitting again.' },
          { status: 429 }
        );
      }
      rateData.count++;
    } else {
      ipRateMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    }

    const body = await request.json();
    const { name, email, message } = body;

    // Strict validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Please enter a message of at least 5 characters.' }, { status: 400 });
    }

    // Save to Turso DB
    try {
      const db = getDb();
      await db.execute({
        sql: 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
        args: [name.trim(), email.trim(), message.trim()],
      });
    } catch (dbErr) {
      console.error('Failed to log message to Turso database:', dbErr);
    }

    // Send email notification to ankit5242raj1@outlook.com
    try {
      await sendContactNotification(name.trim(), email.trim(), message.trim());
    } catch (mailErr) {
      console.error('Failed to dispatch nodemailer:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Transmission successfully delivered to Ankit Raj Maurya.',
    });
  } catch (err: any) {
    console.error('Contact endpoint error:', err);
    return NextResponse.json(
      { error: 'Failed to process transmission. Please try again or reach out directly at ankit5242raj1@outlook.com' },
      { status: 500 }
    );
  }
}
