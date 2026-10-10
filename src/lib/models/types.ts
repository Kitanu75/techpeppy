export interface AuthorInfo {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  karma: number;
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
