import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/turso';

export async function GET() {
  try {
    const db = await ensureDbInitialized();
    const result = await db.execute('SELECT * FROM certificates WHERE visible=1 ORDER BY sort_order ASC, created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Certificates API error:', error);
    return NextResponse.json([
      {
        id: 1,
        title: 'AI Prompt War – Runner-Up',
        issuer: 'Oriental Group of Institutes',
        issue_date: 'Apr 2026',
        credential_url: 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg',
        image_url: 'https://res.cloudinary.com/duhw4pa8k/image/upload/v1778675301/WhatsApp_Image_2026-05-13_at_17.56.14_pvgthh.jpg',
        type: 'certificate',
        sort_order: 1,
        visible: 1,
      },
    ]);
  }
}
