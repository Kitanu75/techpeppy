import { NextRequest, NextResponse } from "next/server";
import { getPostById, deletePost } from "@/lib/data/store";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to delete a post" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    // Only post author or admin can delete
    const isAuthor = post.author?.id === user.id || post.author?.username === user.username;
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Permission denied. Only author or admin can delete this post." },
        { status: 403 }
      );
    }

    await deletePost(id);
    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
