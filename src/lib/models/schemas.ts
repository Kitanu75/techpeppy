import mongoose, { Schema, models, model } from "mongoose";

// Community Schema
const CommunitySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: "🔥" },
    bannerColor: { type: String, default: "#2563EB" },
    membersCount: { type: Number, default: 1 },
    rules: [{ type: String }],
  },
  { timestamps: true }
);

// Post Schema
const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, default: "" },
    images: [{ type: String }],
    postType: { type: String, enum: ["text", "image"], default: "text" },
    communitySlug: { type: String, required: true, index: true },
    author: {
      id: { type: String },
      name: { type: String, required: true },
      username: { type: String, required: true },
      avatar: { type: String, default: "" },
      karma: { type: Number, default: 0 },
    },
    score: { type: Number, default: 1, index: true },
    upvotes: { type: Number, default: 1 },
    downvotes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Comment Schema
const CommentSchema = new Schema(
  {
    postId: { type: String, required: true, index: true },
    parentId: { type: String, default: null, index: true },
    content: { type: String, required: true },
    author: {
      id: { type: String },
      name: { type: String, required: true },
      username: { type: String, required: true },
      avatar: { type: String, default: "" },
      karma: { type: Number, default: 0 },
    },
    score: { type: Number, default: 1 },
    upvotes: { type: Number, default: 1 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Vote Schema (Ensures unique 1 vote per user per target)
const VoteSchema = new Schema(
  {
    userId: { type: String, required: true },
    targetId: { type: String, required: true },
    targetType: { type: String, enum: ["post", "comment"], required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);
VoteSchema.index({ userId: 1, targetId: 1 }, { unique: true });

export const CommunityModel = models.Community || model("Community", CommunitySchema);
export const PostModel = models.Post || model("Post", PostSchema);
export const CommentModel = models.Comment || model("Comment", CommentSchema);
export const VoteModel = models.Vote || model("Vote", VoteSchema);
