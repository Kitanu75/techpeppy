import connectToDatabase from "../mongodb";
import {
  CommunityModel,
  PostModel,
  CommentModel,
  VoteModel,
  SubscriptionModel,
  NotificationModel,
} from "../models/schemas";
import { INITIAL_COMMUNITIES, INITIAL_POSTS, INITIAL_COMMENTS } from "./initialData";
import {
  PostType,
  CommunityType,
  CommentType,
  SubscriptionType,
  NotificationType,
} from "../models/types";
import { sendNewSubscriberAlert } from "../email";

// In-memory fallback state for zero-config preview
let memoryPosts: PostType[] = [...INITIAL_POSTS];
let memoryCommunities: CommunityType[] = [...INITIAL_COMMUNITIES];
let memoryComments: CommentType[] = [...INITIAL_COMMENTS];
let memorySubscriptions: SubscriptionType[] = [];
let memoryNotifications: NotificationType[] = [];

// Global seed tracker
let isSeeded = false;

async function ensureSeeded() {
  if (isSeeded) return;
  isSeeded = true;
  const db = await connectToDatabase();
  if (db) {
    try {
      for (const comm of INITIAL_COMMUNITIES) {
        await CommunityModel.findOneAndUpdate(
          { slug: comm.slug },
          { ...comm },
          { upsert: true }
        );
      }

      // Clean out any previously injected mock posts from DB
      const mockSlugs = [
        "minimalist-dual-monitor-developer-setup",
        "decoupled-headless-cms-nextjs-15-latency",
        "local-llm-inference-consumer-gpus-32b-models",
        "vector-search-pipelines-pgvector-vs-dedicated",
        "why-mongodb-nextjs-server-components-game-changer",
        "flagship-camera-sensor-comparison-1-inch-vs-periscope",
        "techpeppy-community-guidelines-welcome",
      ];
      for (const post of INITIAL_POSTS) {
        const postDoc = await PostModel.findOneAndUpdate(
          { slug: post.slug },
          { 
            $set: { 
              title: post.title, 
              content: post.content, 
              tags: post.tags, 
              images: post.images,
              commentsCount: post.commentsCount 
            } 
          },
          { upsert: true, new: true }
        );

        if (postDoc) {
          const existingComments = await CommentModel.countDocuments({
            $or: [{ postId: postDoc._id.toString() }, { postId: post.id }, { postId: post.slug }]
          });

          if (existingComments === 0) {
            const commentsToSeed = INITIAL_COMMENTS.filter(
              (c) => c.postId === post.id || c.postId === post.slug
            );
            for (const c of commentsToSeed) {
              const rootDoc = await CommentModel.create({
                postId: postDoc._id.toString(),
                parentId: null,
                content: c.content,
                author: c.author,
                score: c.score,
                upvotes: c.upvotes,
                downvotes: c.downvotes,
              });

              if (c.replies && c.replies.length > 0) {
                for (const r of c.replies) {
                  await CommentModel.create({
                    postId: postDoc._id.toString(),
                    parentId: rootDoc._id.toString(),
                    content: r.content,
                    author: r.author,
                    score: r.score,
                    upvotes: r.upvotes,
                    downvotes: r.downvotes,
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("DB seed notice:", e);
    }
  }
}

export async function getCommunities(): Promise<CommunityType[]> {
  const db = await connectToDatabase();
  if (db) {
    try {
      await ensureSeeded();
      const docs = await CommunityModel.find().lean();
      if (docs.length > 0) {
        return docs.map((d: any) => ({
          id: d._id.toString(),
          name: d.name,
          slug: d.slug,
          description: d.description,
          icon: d.icon,
          bannerColor: d.bannerColor,
          membersCount: d.membersCount,
          rules: d.rules,
        }));
      }
    } catch (err) {
      console.warn("Error fetching communities from MongoDB, using fallback:", err);
    }
  }
  return memoryCommunities;
}

export async function getPosts(communitySlug?: string, sort: string = "hot", search?: string): Promise<PostType[]> {
  const db = await connectToDatabase();
  let posts: PostType[] = [];

  if (db) {
    try {
      await ensureSeeded();
      const filter: any = {};
      if (communitySlug && communitySlug !== "all") {
        filter.communitySlug = communitySlug;
      }
      if (search && search.trim()) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const docs = await PostModel.find(filter).lean();
      const mapped = docs.map((d: any) => ({
        id: d._id.toString(),
        title: d.title,
        slug: d.slug,
        content: d.content,
        images: d.images || [],
        postType: d.postType || "text",
        communitySlug: d.communitySlug,
        communityName: memoryCommunities.find((c) => c.slug === d.communitySlug)?.name || d.communitySlug,
        author: d.author,
        score: d.score,
        upvotes: d.upvotes,
        downvotes: d.downvotes,
        commentsCount: d.commentsCount,
        tags: d.tags || [],
        isPinned: d.isPinned,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
      }));

      // Deduplicate by slug
      const seenSlugs = new Set<string>();
      posts = mapped.filter((p) => {
        if (!p.slug || seenSlugs.has(p.slug)) return false;
        seenSlugs.add(p.slug);
        return true;
      });
    } catch (err) {
      console.warn("Error fetching posts from MongoDB, using in-memory store:", err);
      posts = [...memoryPosts];
    }
  } else {
    posts = [...memoryPosts];
    if (communitySlug && communitySlug !== "all") {
      posts = posts.filter((p) => p.communitySlug === communitySlug);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
  }

  // Sort logic (Hot, New, Top, Trending)
  if (sort === "new") {
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === "top") {
    posts.sort((a, b) => b.score - a.score);
  } else if (sort === "trending") {
    posts.sort((a, b) => b.commentsCount - a.commentsCount);
  } else {
    // "hot" Reddit algorithm: score / (hours_age + 2)^1.5
    posts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const ageHoursA = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
      const ageHoursB = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
      const hotScoreA = (a.score + 1) / Math.pow(ageHoursA + 2, 1.5);
      const hotScoreB = (b.score + 1) / Math.pow(ageHoursB + 2, 1.5);
      return hotScoreB - hotScoreA;
    });
  }

  return posts;
}

export async function getPostById(id: string): Promise<PostType | null> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const doc = await PostModel.findById(id).lean();
      if (doc) {
        return {
          id: (doc as any)._id.toString(),
          title: (doc as any).title,
          slug: (doc as any).slug,
          content: (doc as any).content,
          images: (doc as any).images || [],
          postType: (doc as any).postType || "text",
          communitySlug: (doc as any).communitySlug,
          communityName: memoryCommunities.find((c) => c.slug === (doc as any).communitySlug)?.name,
          author: (doc as any).author,
          score: (doc as any).score,
          upvotes: (doc as any).upvotes,
          downvotes: (doc as any).downvotes,
          commentsCount: (doc as any).commentsCount,
          tags: (doc as any).tags || [],
          isPinned: (doc as any).isPinned,
          createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn("DB getPostById error:", e);
    }
  }
  return memoryPosts.find((p) => p.id === id) || null;
}

export async function createPost(newPost: Omit<PostType, "id" | "score" | "upvotes" | "downvotes" | "commentsCount" | "createdAt">): Promise<PostType> {
  const created: PostType = {
    ...newPost,
    id: "post_" + Date.now(),
    score: 1,
    upvotes: 1,
    downvotes: 0,
    userVote: 1,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };

  const db = await connectToDatabase();
  if (db) {
    try {
      const doc = await PostModel.create({
        ...created,
        _id: undefined,
      });
      created.id = doc._id.toString();
    } catch (e) {
      console.warn("Error saving post to MongoDB, saved to memory:", e);
    }
  }

  memoryPosts.unshift(created);

  // Notify publication & channel subscribers about the new post
  notifyChannelSubscribersOnNewPost(created).catch((err) =>
    console.warn("notifyChannelSubscribersOnNewPost error:", err)
  );

  return created;
}

export async function votePost(postId: string, voteValue: 1 | -1 | 0, userId: string = "user_default"): Promise<{ score: number; userVote: number }> {
  let post = memoryPosts.find((p) => p.id === postId);
  const currentVote = post?.userVote || 0;
  let delta = 0;

  if (voteValue === currentVote) {
    // Unvote
    delta = -voteValue;
    if (post) post.userVote = 0;
  } else {
    // Change vote
    delta = voteValue - currentVote;
    if (post) post.userVote = voteValue as any;
  }

  if (post) {
    post.score += delta;
    if (voteValue === 1 && currentVote !== 1) post.upvotes += 1;
    if (voteValue === -1 && currentVote !== -1) post.downvotes += 1;
  }

  const db = await connectToDatabase();
  if (db) {
    try {
      await PostModel.findByIdAndUpdate(postId, {
        $inc: { score: delta },
      });
      if (voteValue !== 0) {
        await VoteModel.findOneAndUpdate(
          { userId, targetId: postId, targetType: "post" },
          { value: voteValue },
          { upsert: true }
        );
      } else {
        await VoteModel.deleteOne({ userId, targetId: postId, targetType: "post" });
      }
    } catch (e) {
      console.warn("Error updating vote in MongoDB:", e);
    }
  }

  return {
    score: post ? post.score : 1,
    userVote: post?.userVote || 0,
  };
}

export async function deletePost(postId: string): Promise<boolean> {
  const db = await connectToDatabase();
  if (db) {
    try {
      await PostModel.findByIdAndDelete(postId);
      await CommentModel.deleteMany({ postId });
      await VoteModel.deleteMany({ targetId: postId });
    } catch (e) {
      console.warn("DB deletePost error:", e);
    }
  }
  memoryPosts = memoryPosts.filter((p) => p.id !== postId);
  memoryComments = memoryComments.filter((c) => c.postId !== postId);
  return true;
}

export async function clearAllPostsAndComments(): Promise<void> {
  const db = await connectToDatabase();
  if (db) {
    try {
      await PostModel.deleteMany({});
      await CommentModel.deleteMany({});
      await VoteModel.deleteMany({});
    } catch (e) {
      console.warn("DB clearAll error:", e);
    }
  }
  memoryPosts = [];
  memoryComments = [];
}

export async function getComments(postId: string): Promise<CommentType[]> {
  const db = await connectToDatabase();

  // Collect all possible identifiers for this post (ObjectId string, slug, memory ID)
  const identifiers = new Set<string>([postId]);

  if (db) {
    try {
      await ensureSeeded();

      let postDoc: any = null;
      try {
        postDoc = await PostModel.findById(postId).lean();
      } catch {
        // Not a standard MongoDB ObjectId
      }
      if (!postDoc) {
        postDoc = await PostModel.findOne({ slug: postId }).lean();
      }

      if (postDoc) {
        identifiers.add(postDoc._id.toString());
        if (postDoc.slug) identifiers.add(postDoc.slug);
        const memPost = memoryPosts.find((p) => p.slug === postDoc.slug);
        if (memPost) identifiers.add(memPost.id);
      } else {
        const memPost = memoryPosts.find((p) => p.id === postId || p.slug === postId);
        if (memPost) {
          identifiers.add(memPost.id);
          identifiers.add(memPost.slug);
        }
      }

      const idArray = Array.from(identifiers);
      const docs = await CommentModel.find({ postId: { $in: idArray } }).lean();

      if (docs.length > 0) {
        const flat: CommentType[] = docs.map((d: any) => ({
          id: d._id.toString(),
          postId: d.postId,
          parentId: d.parentId,
          content: d.content,
          author: d.author,
          score: d.score,
          upvotes: d.upvotes,
          downvotes: d.downvotes,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          replies: [],
        }));

        // Build nested tree
        const map = new Map<string, CommentType>();
        flat.forEach((c) => map.set(c.id, c));
        const rootComments: CommentType[] = [];

        flat.forEach((c) => {
          if (c.parentId && map.has(c.parentId)) {
            map.get(c.parentId)!.replies!.push(c);
          } else {
            rootComments.push(c);
          }
        });

        return rootComments;
      }
    } catch (e) {
      console.warn("DB getComments error:", e);
    }
  }

  // Fallback to memory comments
  const memPost = memoryPosts.find((p) => p.id === postId || p.slug === postId);
  if (memPost) {
    identifiers.add(memPost.id);
    identifiers.add(memPost.slug);
  }
  const idArray = Array.from(identifiers);

  const matched = memoryComments.filter((c) => idArray.includes(c.postId));
  return matched;
}

export async function addComment(
  postId: string,
  content: string,
  parentId: string | null = null,
  author: any
): Promise<CommentType> {
  const newComment: CommentType = {
    id: "comm_" + Date.now(),
    postId,
    parentId,
    content,
    author: author || {
      name: "Community Member",
      username: "user_peppy",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      karma: 50,
    },
    score: 1,
    upvotes: 1,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    replies: [],
  };

  const db = await connectToDatabase();
  if (db) {
    try {
      const doc = await CommentModel.create({
        ...newComment,
        _id: undefined,
      });
      newComment.id = doc._id.toString();

      // Increment commentsCount in MongoDB by id or slug
      try {
        await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
      } catch {
        await PostModel.findOneAndUpdate({ slug: postId }, { $inc: { commentsCount: 1 } });
      }
    } catch (e) {
      console.warn("DB addComment error:", e);
    }
  }

  // Update in memory
  const post = memoryPosts.find((p) => p.id === postId || p.slug === postId);
  if (post) post.commentsCount += 1;

  if (parentId) {
    const parent = memoryComments.find((c) => c.id === parentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      parent.replies.push(newComment);
    } else {
      memoryComments.push(newComment);
    }
  } else {
    memoryComments.push(newComment);
  }

  // Notify post subscribers and post author about the new comment (Reddit-style)
  notifyPostSubscribersOnComment(postId, newComment).catch((err) =>
    console.warn("notifyPostSubscribersOnComment error:", err)
  );

  return newComment;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const commentDoc = await CommentModel.findById(commentId);
      if (commentDoc) {
        const pId = commentDoc.postId;
        await CommentModel.findByIdAndDelete(commentId);
        await CommentModel.deleteMany({ parentId: commentId });
        try {
          await PostModel.findByIdAndUpdate(pId, { $inc: { commentsCount: -1 } });
        } catch {
          await PostModel.findOneAndUpdate({ slug: pId }, { $inc: { commentsCount: -1 } });
        }
      }
    } catch (e) {
      console.warn("DB deleteComment error:", e);
    }
  }
  memoryComments = memoryComments.filter((c) => c.id !== commentId && c.parentId !== commentId);
  return true;
}

// ==========================================
// SUBSCRIPTIONS & REAL-TIME NOTIFICATIONS
// ==========================================

interface RawSubscriptionDoc {
  _id?: { toString(): string };
  id?: string;
  subscriberId: string;
  subscriberEmail?: string;
  subscriberName: string;
  subscriberAvatar?: string;
  targetUserId?: string;
  channelSlug?: string;
  postId?: string;
  postTitle?: string;
  createdAt?: Date | string;
}

interface RawNotificationDoc {
  _id?: { toString(): string };
  id?: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  type?: "NEW_SUBSCRIBER" | "POST_COMMENT" | "NEW_POST";
  channelSlug?: string;
  postId?: string;
  postTitle?: string;
  message: string;
  isRead?: boolean;
  createdAt?: Date | string;
}

let subscriptionIndexMigrated = false;

async function ensureSubscriptionIndexes() {
  if (subscriptionIndexMigrated) return;
  subscriptionIndexMigrated = true;
  try {
    await SubscriptionModel.collection
      .dropIndex("subscriberId_1_targetUserId_1_channelSlug_1")
      .catch(() => {});
  } catch {
    // Ignore if index does not exist
  }
}

function truncateText(text: string, maxLen: number): string {
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1)}…`;
}

function mapSubscriptionDoc(d: RawSubscriptionDoc): SubscriptionType {
  return {
    id: d._id ? d._id.toString() : d.id || "",
    subscriberId: d.subscriberId,
    subscriberEmail: d.subscriberEmail || undefined,
    subscriberName: d.subscriberName,
    subscriberAvatar: d.subscriberAvatar || "",
    targetUserId: d.targetUserId || "usr_sandeep_author",
    channelSlug: d.channelSlug || "publication",
    postId: d.postId || undefined,
    postTitle: d.postTitle || undefined,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
  };
}

function mapNotificationDoc(d: RawNotificationDoc): NotificationType {
  return {
    id: d._id ? d._id.toString() : d.id || "",
    recipientId: d.recipientId,
    actorId: d.actorId,
    actorName: d.actorName,
    actorAvatar: d.actorAvatar || "",
    type: d.type || "NEW_SUBSCRIBER",
    channelSlug: d.channelSlug || "publication",
    postId: d.postId || undefined,
    postTitle: d.postTitle || undefined,
    message: d.message,
    isRead: Boolean(d.isRead),
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function getSubscriptions(subscriberId?: string): Promise<{
  subscriptions: SubscriptionType[];
  subscribedChannels: string[];
  subscribedAuthors: string[];
  subscribedPosts: string[];
  totalSubscribers: number;
}> {
  const db = await connectToDatabase();
  if (db) {
    try {
      const allDocs = (await SubscriptionModel.find({}).lean()) as unknown as RawSubscriptionDoc[];
      const uniqueSubscribers = new Set(allDocs.map((d) => d.subscriberId));

      const filteredDocs = subscriberId
        ? allDocs.filter((d) => d.subscriberId === subscriberId)
        : [];
      const subscriptions = filteredDocs.map(mapSubscriptionDoc);
      const subscribedChannels = Array.from(
        new Set(
          subscriptions
            .filter((s) => !s.postId && s.channelSlug !== "author")
            .map((s) => s.channelSlug || "publication")
        )
      );
      const subscribedAuthors = Array.from(
        new Set(
          subscriptions
            .filter((s) => !s.postId && s.channelSlug === "author")
            .map((s) => s.targetUserId)
            .filter((id): id is string => Boolean(id))
        )
      );
      const subscribedPosts = Array.from(
        new Set(subscriptions.map((s) => s.postId).filter((id): id is string => Boolean(id)))
      );

      return {
        subscriptions,
        subscribedChannels,
        subscribedAuthors,
        subscribedPosts,
        totalSubscribers: uniqueSubscribers.size,
      };
    } catch (err) {
      console.warn("Error fetching subscriptions from MongoDB, using fallback:", err);
    }
  }

  const uniqueMemSubscribers = new Set(memorySubscriptions.map((s) => s.subscriberId));
  const subscriptions = subscriberId
    ? memorySubscriptions.filter((s) => s.subscriberId === subscriberId)
    : [];
  const subscribedChannels = Array.from(
    new Set(
      subscriptions
        .filter((s) => !s.postId && s.channelSlug !== "author")
        .map((s) => s.channelSlug || "publication")
    )
  );
  const subscribedAuthors = Array.from(
    new Set(
      subscriptions
        .filter((s) => !s.postId && s.channelSlug === "author")
        .map((s) => s.targetUserId)
        .filter((id): id is string => Boolean(id))
    )
  );
  const subscribedPosts = Array.from(
    new Set(subscriptions.map((s) => s.postId).filter((id): id is string => Boolean(id)))
  );

  return {
    subscriptions,
    subscribedChannels,
    subscribedAuthors,
    subscribedPosts,
    totalSubscribers: uniqueMemSubscribers.size,
  };
}

export async function createOrToggleSubscription(params: {
  subscriberId: string;
  subscriberEmail?: string;
  subscriberName: string;
  subscriberAvatar?: string;
  targetUserId?: string;
  channelSlug?: string;
  postId?: string;
  postTitle?: string;
  action?: "subscribe" | "unsubscribe" | "toggle";
}): Promise<{
  subscribed: boolean;
  subscription?: SubscriptionType;
  notification?: NotificationType;
  totalSubscribers: number;
}> {
  const subscriberId = params.subscriberId;
  const targetUserId = params.targetUserId || "usr_sandeep_author";
  const channelSlug = params.channelSlug || "publication";
  const postId = params.postId ? params.postId.trim() : "";
  const postTitle = params.postTitle ? params.postTitle.trim() : "";
  const subscriberName = params.subscriberName || "Engineering Reader";
  const subscriberEmail = params.subscriberEmail || "";
  const subscriberAvatar =
    params.subscriberAvatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(subscriberId)}`;
  const action = params.action || "toggle";

  const shortPostTitle = postTitle ? truncateText(postTitle, 52) : "";
  const notificationMessage =
    channelSlug === "author"
      ? "subscribed to your posts"
      : postId
        ? shortPostTitle
          ? `subscribed to your post "${shortPostTitle}"`
          : "subscribed to your post"
        : channelSlug && channelSlug !== "publication"
          ? `subscribed to ${channelSlug}`
          : "subscribed to TechPeppy";

  const db = await connectToDatabase();
  if (db) {
    try {
      await ensureSubscriptionIndexes();

      const existing = (await SubscriptionModel.findOne({
        subscriberId,
        targetUserId,
        channelSlug,
        postId,
      }).lean()) as unknown as RawSubscriptionDoc | null;

      if (existing && (action === "unsubscribe" || action === "toggle")) {
        await SubscriptionModel.deleteOne({ _id: existing._id });
        memorySubscriptions = memorySubscriptions.filter(
          (s) =>
            !(
              s.subscriberId === subscriberId &&
              s.targetUserId === targetUserId &&
              (s.channelSlug || "publication") === channelSlug &&
              (s.postId || "") === postId
            )
        );
        const allIds = await SubscriptionModel.distinct("subscriberId");
        return {
          subscribed: false,
          totalSubscribers: allIds.length,
        };
      }

      if (existing && action === "subscribe") {
        const allIds = await SubscriptionModel.distinct("subscriberId");
        return {
          subscribed: true,
          subscription: mapSubscriptionDoc(existing),
          totalSubscribers: allIds.length,
        };
      }

      // Create new subscription
      const subDoc = (await SubscriptionModel.findOneAndUpdate(
        { subscriberId, targetUserId, channelSlug, postId },
        {
          $set: {
            subscriberEmail,
            subscriberName,
            subscriberAvatar,
            postTitle,
          },
        },
        { upsert: true, new: true }
      ).lean()) as unknown as RawSubscriptionDoc;

      const subscription = mapSubscriptionDoc(subDoc);

      // Idempotent notification: avoid duplicate notification rows on rapid unsubscribe/re-subscribe
      const existingNotif = await NotificationModel.findOne({
        recipientId: targetUserId,
        actorId: subscriberId,
        type: "NEW_SUBSCRIBER",
        channelSlug,
        postId,
      });

      let notifDoc: RawNotificationDoc;
      if (existingNotif) {
        existingNotif.actorName = subscriberName;
        existingNotif.actorAvatar = subscriberAvatar;
        existingNotif.postTitle = postTitle;
        existingNotif.message = notificationMessage;
        existingNotif.isRead = false;
        existingNotif.createdAt = new Date();
        await existingNotif.save();
        notifDoc = existingNotif.toObject() as unknown as RawNotificationDoc;
      } else {
        const createdDoc = await NotificationModel.create({
          recipientId: targetUserId,
          actorId: subscriberId,
          actorName: subscriberName,
          actorAvatar: subscriberAvatar,
          type: "NEW_SUBSCRIBER",
          channelSlug,
          postId,
          postTitle,
          message: notificationMessage,
          isRead: false,
        });
        notifDoc = createdDoc.toObject() as unknown as RawNotificationDoc;
      }

      const notification = mapNotificationDoc(notifDoc);
      const allIds = await SubscriptionModel.distinct("subscriberId");

      // Fire non-blocking email/webhook alert
      sendNewSubscriberAlert({
        subscriberName,
        subscriberEmail: subscriberEmail || undefined,
        channelSlug: postId ? `${channelSlug} (${shortPostTitle || postId})` : channelSlug,
      }).catch(() => {});

      return {
        subscribed: true,
        subscription,
        notification,
        totalSubscribers: allIds.length,
      };
    } catch (err) {
      console.warn("DB createOrToggleSubscription error, falling back to memory:", err);
    }
  }

  // In-memory resilient fallback
  const existingIdx = memorySubscriptions.findIndex(
    (s) =>
      s.subscriberId === subscriberId &&
      s.targetUserId === targetUserId &&
      (s.channelSlug || "publication") === channelSlug &&
      (s.postId || "") === postId
  );

  if (existingIdx !== -1 && (action === "unsubscribe" || action === "toggle")) {
    memorySubscriptions.splice(existingIdx, 1);
    const uniqueMem = new Set(memorySubscriptions.map((s) => s.subscriberId));
    return {
      subscribed: false,
      totalSubscribers: uniqueMem.size,
    };
  }

  if (existingIdx !== -1 && action === "subscribe") {
    const uniqueMem = new Set(memorySubscriptions.map((s) => s.subscriberId));
    return {
      subscribed: true,
      subscription: memorySubscriptions[existingIdx],
      totalSubscribers: uniqueMem.size,
    };
  }

  const newSub: SubscriptionType = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    subscriberId,
    subscriberEmail: subscriberEmail || undefined,
    subscriberName,
    subscriberAvatar,
    targetUserId,
    channelSlug,
    postId: postId || undefined,
    postTitle: postTitle || undefined,
    createdAt: new Date().toISOString(),
  };
  memorySubscriptions.unshift(newSub);

  // Idempotent in-memory notification
  const existingNotifIdx = memoryNotifications.findIndex(
    (n) =>
      n.recipientId === targetUserId &&
      n.actorId === subscriberId &&
      n.type === "NEW_SUBSCRIBER" &&
      (n.channelSlug || "publication") === channelSlug &&
      (n.postId || "") === postId
  );

  let notification: NotificationType;
  if (existingNotifIdx !== -1) {
    notification = {
      ...memoryNotifications[existingNotifIdx],
      actorName: subscriberName,
      actorAvatar: subscriberAvatar,
      postTitle: postTitle || undefined,
      message: notificationMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    memoryNotifications.splice(existingNotifIdx, 1);
    memoryNotifications.unshift(notification);
  } else {
    notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      recipientId: targetUserId,
      actorId: subscriberId,
      actorName: subscriberName,
      actorAvatar: subscriberAvatar,
      type: "NEW_SUBSCRIBER",
      channelSlug,
      postId: postId || undefined,
      postTitle: postTitle || undefined,
      message: notificationMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    memoryNotifications.unshift(notification);
  }

  const uniqueMem = new Set(memorySubscriptions.map((s) => s.subscriberId));

  sendNewSubscriberAlert({
    subscriberName,
    subscriberEmail: subscriberEmail || undefined,
    channelSlug: postId ? `${channelSlug} (${shortPostTitle || postId})` : channelSlug,
  }).catch(() => {});

  return {
    subscribed: true,
    subscription: newSub,
    notification,
    totalSubscribers: uniqueMem.size,
  };
}

async function dispatchActivityNotifications(params: {
  recipientIds: string[];
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: "POST_COMMENT" | "NEW_POST";
  channelSlug: string;
  postId: string;
  postTitle: string;
  message: string;
}) {
  const uniqueRecipients = Array.from(
    new Set(params.recipientIds.filter((rid) => Boolean(rid) && rid !== params.actorId))
  );
  if (uniqueRecipients.length === 0) return;

  const db = await connectToDatabase();
  if (db) {
    try {
      await NotificationModel.insertMany(
        uniqueRecipients.map((recipientId) => ({
          recipientId,
          actorId: params.actorId,
          actorName: params.actorName,
          actorAvatar: params.actorAvatar,
          type: params.type,
          channelSlug: params.channelSlug,
          postId: params.postId,
          postTitle: params.postTitle,
          message: params.message,
          isRead: false,
        }))
      );
      return;
    } catch (err) {
      console.warn("DB dispatchActivityNotifications error, using fallback:", err);
    }
  }

  for (const recipientId of uniqueRecipients) {
    memoryNotifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      recipientId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorAvatar: params.actorAvatar,
      type: params.type,
      channelSlug: params.channelSlug,
      postId: params.postId,
      postTitle: params.postTitle,
      message: params.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }
}

async function notifyPostSubscribersOnComment(postId: string, comment: CommentType) {
  let targetPost: PostType | null =
    memoryPosts.find((p) => p.id === postId || p.slug === postId) || null;
  const postIdentifiers = new Set<string>([postId]);

  const db = await connectToDatabase();
  if (db) {
    try {
      let postDoc: Record<string, unknown> | null = null;
      try {
        postDoc = (await PostModel.findById(postId).lean()) as unknown as Record<string, unknown> | null;
      } catch {
        // Ignore invalid ObjectId
      }
      if (!postDoc) {
        postDoc = (await PostModel.findOne({ slug: postId }).lean()) as unknown as Record<
          string,
          unknown
        > | null;
      }
      if (postDoc) {
        const docId = (postDoc._id as { toString(): string }).toString();
        postIdentifiers.add(docId);
        if (typeof postDoc.slug === "string") postIdentifiers.add(postDoc.slug);
        if (!targetPost) {
          targetPost = {
            id: docId,
            title: String(postDoc.title || ""),
            slug: String(postDoc.slug || ""),
            content: String(postDoc.content || ""),
            images: [],
            postType: "text",
            communitySlug: String(postDoc.communitySlug || "software-architecture"),
            author: (postDoc.author as PostType["author"]) || {
              id: "usr_sandeep_author",
              name: "Sandeep Kumar",
              username: "sandeep",
              avatar: "",
              karma: 0,
            },
            score: 1,
            upvotes: 1,
            downvotes: 0,
            commentsCount: 0,
            tags: [],
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn("Lookup post for comment notification failed:", err);
    }
  }

  if (targetPost) {
    postIdentifiers.add(targetPost.id);
    if (targetPost.slug) postIdentifiers.add(targetPost.slug);
  }

  const idList = Array.from(postIdentifiers);
  const channelSlug = targetPost?.communitySlug || "software-architecture";
  const postTitle = targetPost?.title || "this post";
  const shortTitle = truncateText(postTitle, 44);
  const shortComment = truncateText(comment.content, 60);

  const recipientIds: string[] = [targetPost?.author?.id || "usr_sandeep_author"];

  if (db) {
    try {
      const subs = (await SubscriptionModel.find({
        $or: [{ postId: { $in: idList } }, { channelSlug, postId: "" }],
      }).lean()) as unknown as RawSubscriptionDoc[];
      subs.forEach((s) => recipientIds.push(s.subscriberId));
    } catch (err) {
      console.warn("DB subscription lookup for comment failed:", err);
    }
  } else {
    memorySubscriptions
      .filter(
        (s) =>
          (s.postId && idList.includes(s.postId)) ||
          (!s.postId && s.channelSlug === channelSlug)
      )
      .forEach((s) => recipientIds.push(s.subscriberId));
  }

  await dispatchActivityNotifications({
    recipientIds,
    actorId: comment.author?.id || comment.author?.username || "user_commenter",
    actorName: comment.author?.name || comment.author?.username || "Community Member",
    actorAvatar: comment.author?.avatar || "",
    type: "POST_COMMENT",
    channelSlug,
    postId: targetPost?.id || postId,
    postTitle,
    message: `commented on "${shortTitle}": "${shortComment}"`,
  });
}

async function notifyChannelSubscribersOnNewPost(post: PostType) {
  const recipientIds: string[] = [];
  const authorKeys = Array.from(
    new Set([post.author?.id, post.author?.username].filter((v): v is string => Boolean(v)))
  );
  const db = await connectToDatabase();

  if (db) {
    try {
      const orFilters: Record<string, unknown>[] = [
        { postId: "", channelSlug: { $in: [post.communitySlug, "publication"] } },
      ];
      if (authorKeys.length > 0) {
        orFilters.push({
          postId: "",
          channelSlug: "author",
          targetUserId: { $in: authorKeys },
        });
      }
      const subs = (await SubscriptionModel.find({
        $or: orFilters,
      }).lean()) as unknown as RawSubscriptionDoc[];
      subs.forEach((s) => recipientIds.push(s.subscriberId));
    } catch (err) {
      console.warn("DB subscription lookup for new post failed:", err);
    }
  } else {
    memorySubscriptions
      .filter(
        (s) =>
          !s.postId &&
          (s.channelSlug === post.communitySlug ||
            s.channelSlug === "publication" ||
            (s.channelSlug === "author" && authorKeys.includes(s.targetUserId)))
      )
      .forEach((s) => recipientIds.push(s.subscriberId));
  }

  const shortTitle = truncateText(post.title, 54);

  await dispatchActivityNotifications({
    recipientIds,
    actorId: post.author?.id || post.author?.username || "usr_sandeep_author",
    actorName: post.author?.name || post.author?.username || "Author",
    actorAvatar: post.author?.avatar || "",
    type: "NEW_POST",
    channelSlug: post.communitySlug,
    postId: post.id,
    postTitle: post.title,
    message: `published a new post: "${shortTitle}"`,
  });
}

export async function getNotifications(
  recipientId?: string,
  clientId?: string
): Promise<{
  notifications: NotificationType[];
  unreadCount: number;
}> {
  const recipientScope = Array.from(
    new Set([recipientId, clientId, "usr_sandeep_author"].filter((id): id is string => Boolean(id)))
  );

  const db = await connectToDatabase();
  if (db) {
    try {
      const filter = recipientScope.length > 0 ? { recipientId: { $in: recipientScope } } : {};
      const docs = (await NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()) as unknown as RawNotificationDoc[];
      const notifications = docs.map(mapNotificationDoc);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { notifications, unreadCount };
    } catch (err) {
      console.warn("DB getNotifications error, using fallback:", err);
    }
  }

  const filtered =
    recipientScope.length > 0
      ? memoryNotifications.filter((n) => recipientScope.includes(n.recipientId))
      : [...memoryNotifications];

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sliced = filtered.slice(0, 50);
  return {
    notifications: sliced,
    unreadCount: sliced.filter((n) => !n.isRead).length,
  };
}

export async function markNotificationsRead(params: {
  notificationId?: string;
  markAll?: boolean;
  recipientId?: string;
  clientId?: string;
}): Promise<{
  notifications: NotificationType[];
  unreadCount: number;
}> {
  const { notificationId, markAll, recipientId, clientId } = params;
  const recipientScope = Array.from(
    new Set([recipientId, clientId, "usr_sandeep_author"].filter((id): id is string => Boolean(id)))
  );
  const db = await connectToDatabase();

  if (db) {
    try {
      if (markAll) {
        const filter =
          recipientScope.length > 0
            ? { recipientId: { $in: recipientScope }, isRead: false }
            : { isRead: false };
        await NotificationModel.updateMany(filter, { $set: { isRead: true } });
      } else if (notificationId) {
        await NotificationModel.findByIdAndUpdate(notificationId, { $set: { isRead: true } });
      }
    } catch (err) {
      console.warn("DB markNotificationsRead error:", err);
    }
  }

  if (markAll) {
    memoryNotifications = memoryNotifications.map((n) =>
      recipientScope.length === 0 || recipientScope.includes(n.recipientId)
        ? { ...n, isRead: true }
        : n
    );
  } else if (notificationId) {
    memoryNotifications = memoryNotifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
  }

  return getNotifications(recipientId, clientId);
}
