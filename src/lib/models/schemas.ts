import mongoose, { Schema, models, model } from "mongoose";

// User Schema (Auth & Profile)
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    karma: { type: Number, default: 10 },
    bio: { type: String, default: "Tech enthusiast & developer on TechPeppy" },
  },
  { timestamps: true }
);

// Community Schema
const CommunitySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: "layers" },
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
      role: { type: String, default: "user" },
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
      role: { type: String, default: "user" },
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

export const UserModel = models.User || model("User", UserSchema);
export const CommunityModel = models.Community || model("Community", CommunitySchema);
export const PostModel = models.Post || model("Post", PostSchema);
export const CommentModel = models.Comment || model("Comment", CommentSchema);
export const VoteModel = models.Vote || model("Vote", VoteSchema);

// Password Reset Token Schema (15-minute TTL)
const PasswordResetTokenSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

export const PasswordResetTokenModel =
  models.PasswordResetToken || model("PasswordResetToken", PasswordResetTokenSchema);

// Subscription Schema (Tracks publication & channel/author subscriptions)
const SubscriptionSchema = new Schema(
  {
    subscriberId: { type: String, required: true, index: true },
    subscriberEmail: { type: String, lowercase: true, trim: true, default: "" },
    subscriberName: { type: String, required: true },
    subscriberAvatar: { type: String, default: "" },
    targetUserId: { type: String, required: true, default: "usr_sandeep_author", index: true },
    channelSlug: { type: String, default: "publication", index: true },
  },
  { timestamps: true }
);
SubscriptionSchema.index({ subscriberId: 1, targetUserId: 1, channelSlug: 1 }, { unique: true });

// Notification Schema (Real-time subscriber & activity alerts)
const NotificationSchema = new Schema(
  {
    recipientId: { type: String, required: true, index: true },
    actorId: { type: String, required: true, index: true },
    actorName: { type: String, required: true },
    actorAvatar: { type: String, default: "" },
    type: { type: String, enum: ["NEW_SUBSCRIBER"], default: "NEW_SUBSCRIBER" },
    channelSlug: { type: String, default: "publication" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export const SubscriptionModel =
  models.Subscription || model("Subscription", SubscriptionSchema);
export const NotificationModel =
  models.Notification || model("Notification", NotificationSchema);
