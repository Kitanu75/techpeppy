import connectToDatabase from "../mongodb";
import { CommunityModel, PostModel, CommentModel, VoteModel } from "../models/schemas";
import { INITIAL_COMMUNITIES, INITIAL_POSTS, INITIAL_COMMENTS } from "./initialData";
import { PostType, CommunityType, CommentType } from "../models/types";

// In-memory fallback state for zero-config preview
let memoryPosts: PostType[] = [...INITIAL_POSTS];
let memoryCommunities: CommunityType[] = [...INITIAL_COMMUNITIES];
let memoryComments: CommentType[] = [...INITIAL_COMMENTS];

// Global seed tracker
let isSeeded = false;

async function ensureSeeded() {
  if (isSeeded) return;
  const db = await connectToDatabase();
  if (db) {
    try {
      const commCount = await CommunityModel.countDocuments();
      if (commCount === 0) {
        await CommunityModel.insertMany(INITIAL_COMMUNITIES);
      }
      // Note: We intentionally avoid auto-seeding dummy mock posts,
      // so MongoDB Atlas stays clean for genuine user posts.
      isSeeded = true;
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
      posts = docs.map((d: any) => ({
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
          p.tags.some((t) => t.toLowerCase().includes(q))
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
  if (db) {
    try {
      const docs = await CommentModel.find({ postId }).lean();
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

  return memoryComments.filter((c) => c.postId === postId);
}

export async function addComment(postId: string, content: string, parentId: string | null = null, author: any): Promise<CommentType> {
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
      await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    } catch (e) {
      console.warn("DB addComment error:", e);
    }
  }

  // Update in memory
  const post = memoryPosts.find((p) => p.id === postId);
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

  return newComment;
}
