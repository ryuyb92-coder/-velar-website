import { NextRequest, NextResponse } from 'next/server';

const NOTION_VERSION = '2022-06-28';
const NOTION_PAGES_URL = 'https://api.notion.com/v1/pages';

export async function POST(req: NextRequest) {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  // Validate env vars are set
  if (!apiKey || !databaseId) {
    console.error('[book] Missing NOTION_API_KEY or NOTION_DATABASE_ID');
    return NextResponse.json(
      { error: 'Booking service not configured.' },
      { status: 500 }
    );
  }

  // Parse submitted form data
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const {
    name,
    phone,
    email,
    vehicle,
    service,
    preferred_date,
    preferred_time,
    zip,
    notes,
  } = body;

  // Require the minimum useful fields
  if (!name || !phone || !service) {
    return NextResponse.json(
      { error: 'Name, phone, and service are required.' },
      { status: 400 }
    );
  }

  // Build the Notion page properties — types must match the database schema exactly.
  const properties: Record<string, unknown> = {
    // title — required
    'Customer Name': {
      title: [{ text: { content: name } }],
    },
    // phone_number
    'Phone Number': {
      phone_number: phone || null,
    },
    // email
    'Email': {
      email: email || null,
    },
    // rich_text
    'Vehicle': {
      rich_text: [{ text: { content: vehicle || '' } }],
    },
    // select — Notion auto-creates the option if it doesn't exist yet
    'Selected Package': {
      select: service ? { name: service } : null,
    },
    // rich_text — database column is "Service Address"
    'Service Address': {
      rich_text: [{ text: { content: zip || '' } }],
    },
    // rich_text
    'Preferred Time': {
      rich_text: [{ text: { content: preferred_time || '' } }],
    },
    // rich_text
    'Customer Notes': {
      rich_text: [{ text: { content: notes || '' } }],
    },
    // status — "New Lead" is the first option in the database
    'Job Status': {
      status: { name: 'New Lead' },
    },
    // "Created Date" is type created_time — Notion sets it automatically, do not include it
  };

  // Only add Preferred Date if a valid date string was provided
  if (preferred_date) {
    properties['Preferred Date'] = { date: { start: preferred_date } };
  }

  try {
    const res = await fetch(NOTION_PAGES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[book] Notion API error:', res.status, err);
      return NextResponse.json(
        { error: 'Failed to create job record.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[book] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error. Please try calling or texting us.' },
      { status: 500 }
    );
  }
}
