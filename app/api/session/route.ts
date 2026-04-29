// app/api/session/route.ts
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/app/actions/auth";

export async function GET() {
  const userId = await getSessionUserId();
  return NextResponse.json({ userId });
}