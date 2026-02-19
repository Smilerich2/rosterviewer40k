import { NextResponse } from 'next/server';

const PASSWORD = process.env.APP_PASSWORD ?? 'Sigismund';
const TOKEN    = 'tv-authenticated-2024';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password !== PASSWORD) {
      return NextResponse.json({ error: 'Falsches Passwort.' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('tv_auth', TOKEN, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 Tage
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }
}
