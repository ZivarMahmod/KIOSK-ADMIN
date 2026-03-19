import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({
      id: session.uid,
      name: session.name,
      email: session.email,
    });
  } catch {
    return NextResponse.json({ error: "Session check failed" }, { status: 500 });
  }
}
