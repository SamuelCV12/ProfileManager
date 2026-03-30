import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId } from '@/app/actions/auth';

export async function GET() {
  const userId = await getSessionUserId();
  return NextResponse.json({ userId });
}

