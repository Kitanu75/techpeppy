import { NextRequest, NextResponse } from "next/server";
import { votePost } from "@/lib/data/store";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { value, userId } = body;

    if (value !== 1 && value !== -1 && value !== 0) {
      return NextResponse.json({ success: false, error: "Invalid vote value" }, { status: 400 });
    }

    const result = await votePost(id, value, userId || "user_default");
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
