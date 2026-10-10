import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/data/store";
import { getCurrentUser } from "@/lib/auth";

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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please log in to post a comment." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    const comment = await addComment(id, content.trim(), parentId || null, {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      karma: user.karma,
      role: user.role,
    });

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
