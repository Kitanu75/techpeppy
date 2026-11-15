export interface AuthorInfo {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  karma: number;
  role?: string;
}

export interface CommunityType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  bannerColor?: string;
  membersCount: number;
  rules?: string[];
}

export interface CommentType {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  author: AuthorInfo;
  score: number;
  upvotes: number;
  downvotes: number;
  userVote?: 1 | -1 | 0;
  createdAt: string;
  replies?: CommentType[];
}

export interface PostType {
  id: string;
  title: string;
  slug: string;
  content: string;
  images: string[];
  postType: "text" | "image";
  communitySlug: string;
  communityName?: string;
  author: AuthorInfo;
  score: number;
  upvotes: number;
  downvotes: number;
  userVote?: 1 | -1 | 0;
  commentsCount: number;
  tags: string[];
  isPinned?: boolean;
  createdAt: string;
}

export interface SubscriptionType {
  id: string;
  subscriberId: string;
  subscriberEmail?: string;
  subscriberName: string;
  subscriberAvatar: string;
  targetUserId: string;
  channelSlug?: string;
  postId?: string;
  postTitle?: string;
  createdAt: string;
}

export interface NotificationType {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: "NEW_SUBSCRIBER" | "POST_COMMENT" | "NEW_POST";
  channelSlug?: string;
  postId?: string;
  postTitle?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
