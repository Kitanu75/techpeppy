import { NextRequest, NextResponse } from "next/server";
import { getPosts, createPost } from "@/lib/data/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const community = searchParams.get("community") || undefined;
    const sort = searchParams.get("sort") || "hot";
    const q = searchParams.get("q") || undefined;

    const posts = await getPosts(community, sort, q);
    return NextResponse.json({ success: true, posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, images, postType, communitySlug, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    if (!communitySlug) {
      return NextResponse.json({ success: false, error: "Community is required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 80);

    const post = await createPost({
      title: title.trim(),
      slug: slug || "post-" + Date.now(),
      content: content ? content.trim() : "",
      images: Array.isArray(images) ? images : [],
      postType: postType === "image" ? "image" : "text",
      communitySlug,
      author: {
        name: "Sandeep Kumar",
        username: "sandeep_tech",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        karma: 3420,
      },
      tags: Array.isArray(tags) ? tags : ["Tech"],
    });

    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
