import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { clearAllPostsAndComments } from "@/lib/data/store";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    await clearAllPostsAndComments();

    return NextResponse.json({
      success: true,
      message: "All sample mock posts and comments have been permanently cleared. Database is 100% clean!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
