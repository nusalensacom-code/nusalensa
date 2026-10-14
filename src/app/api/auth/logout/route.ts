import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('nusalensa_session');
  response.cookies.delete('updateyuk_session');
  return response;
}
