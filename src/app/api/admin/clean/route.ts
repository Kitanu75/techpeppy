import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { PostModel, CommentModel, VoteModel } from "@/lib/models/schemas";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const db = await connectToDatabase();
    if (db) {
      await PostModel.deleteMany({});
      await CommentModel.deleteMany({});
      await VoteModel.deleteMany({});
      return NextResponse.json({
        success: true,
        message: "All sample posts and comments cleared from MongoDB Atlas. Database is clean!",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database cleared.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
