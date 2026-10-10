import { NextResponse } from "next/server";
import { getCommunities } from "@/lib/data/store";

export async function GET() {
  try {
    const communities = await getCommunities();
    return NextResponse.json({ success: true, communities });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
