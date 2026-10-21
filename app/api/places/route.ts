import { NextRequest, NextResponse } from 'next/server';
import { findPlaceSuggestions } from '@/lib/place-catalog';
import { isCountryCode } from '@/lib/countries';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';
  const country = request.nextUrl.searchParams.get('country') || 'ET';
  if (!isCountryCode(country) || query.length > 80 || /[\u0000-\u001f\u007f]/.test(query)) {
    return NextResponse.json({ error: 'Use a place name of up to 80 characters.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ places: findPlaceSuggestions(query, country) }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
