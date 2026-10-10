import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/data/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const comments = await getComments(id);
    return NextResponse.json({ success: true, comments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { content, parentId, author } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    const comment = await addComment(id, content.trim(), parentId || null, author);
    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
