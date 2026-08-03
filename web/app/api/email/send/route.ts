import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.EMAIL_SERVICE_SECRET;

    if (!secret || secret === 'placeholder_secret') {
      return NextResponse.json({ error: 'Email service secret not configured on Vercel' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields (to, subject, html)' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured on Vercel' }, { status: 500 });
    }

    // Default to Resend's onboarding email if the user hasn't added a domain yet
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('[RESEND API ERROR]', errorData);
      return NextResponse.json({ error: 'Resend API returned an error', details: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error: any) {
    console.error('[VERCEL EMAIL ERROR]', error);
    return NextResponse.json({ error: 'Failed to send email via Resend' }, { status: 500 });
  }
}
