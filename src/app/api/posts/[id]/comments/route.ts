import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment, deleteComment } from "@/lib/data/store";
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

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please log in to delete a comment." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");
    if (!commentId) {
      return NextResponse.json(
        { success: false, error: "commentId is required" },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const comments = await getComments(id);

    const findComment = (list: any[]): any => {
      for (const c of list) {
        if (c.id === commentId) return c;
        if (c.replies?.length) {
          const found = findComment(c.replies);
          if (found) return found;
        }
      }
      return null;
    };

    const targetComment = findComment(comments);
    if (!targetComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    const isAuthor = targetComment.author?.id === user.id || targetComment.author?.username === user.username;
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Permission denied. Only author or admin can delete." },
        { status: 403 }
      );
    }

    await deleteComment(commentId);
    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
