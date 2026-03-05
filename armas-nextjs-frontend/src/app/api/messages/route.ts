import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'src', 'messages');

function messagesFilePath(lang: string): string {
    // Only allow known locales to prevent path traversal
    const ALLOWED = ['en', 'am', 'om'];
    if (!ALLOWED.includes(lang)) throw new Error('Unknown language');
    return path.join(MESSAGES_DIR, `${lang}.json`);
}

/** GET /api/messages?lang=en  — returns the full messages JSON for a locale */
export async function GET(req: NextRequest) {
    const lang = req.nextUrl.searchParams.get('lang') ?? 'en';
    try {
        const filePath = messagesFilePath(lang);
        const raw = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json(JSON.parse(raw));
    } catch (e: any) {
        if (e.message === 'Unknown language') {
            return NextResponse.json({ error: 'Unknown language' }, { status: 400 });
        }
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}

/**
 * PUT /api/messages?lang=am
 * Body: { "section.key": "translated value", ... }
 * Deep-merges the flat key map into the existing JSON and writes it back.
 */
export async function PUT(req: NextRequest) {
    const lang = req.nextUrl.searchParams.get('lang') ?? '';
    try {
        const filePath = messagesFilePath(lang);
        const updates: Record<string, string> = await req.json();

        // Load existing
        const raw = await fs.readFile(filePath, 'utf-8');
        const existing = JSON.parse(raw);

        // Deep-set dot-notated keys  e.g. "sidebar.items.dashboard" → obj
        for (const [flatKey, value] of Object.entries(updates)) {
            setDeep(existing, flatKey, value);
        }

        await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf-8');
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        if (e.message === 'Unknown language') {
            return NextResponse.json({ error: 'Unknown language' }, { status: 400 });
        }
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

/** Set a value at a dot-notated path within a nested object */
function setDeep(obj: Record<string, any>, dotPath: string, value: string): void {
    const parts = dotPath.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) {
            cur[parts[i]] = {};
        }
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
}
