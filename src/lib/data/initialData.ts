import { CommunityType, PostType, CommentType } from "../models/types";

export const INITIAL_COMMUNITIES: CommunityType[] = [
  {
    id: "comm_1",
    name: "Software Architecture",
    slug: "software-architecture",
    description: "System design, decoupled architectures, microservices, and backend performance.",
    icon: "💻",
    bannerColor: "#f3f4f6",
    membersCount: 0,
    rules: ["Technical rationale only", "Keep code snippets clean", "Constructive reviews"],
  },
  {
    id: "comm_2",
    name: "AI & Models",
    slug: "ai-learning",
    description: "Production RAG, local LLMs, model quantization, and autonomous agent systems.",
    icon: "🤖",
    bannerColor: "#f3f4f6",
    membersCount: 0,
    rules: ["Cite model weights", "Reproducible benchmarks only"],
  },
  {
    id: "comm_3",
    name: "Data Science",
    slug: "data-science",
    description: "Data pipelines, vector search, streaming architectures, and SQL/NoSQL stores.",
    icon: "📊",
    bannerColor: "#f3f4f6",
    membersCount: 0,
    rules: ["Discuss latency constraints", "Provide dataset context"],
  },
  {
    id: "comm_4",
    name: "Desk Setups",
    slug: "desk-setups",
    description: "Developer workstations, custom mechanical keyboards, and workspace hardware.",
    icon: "🖥️",
    bannerColor: "#f3f4f6",
    membersCount: 0,
    rules: ["Original photos only", "List hardware components"],
  },
  {
    id: "comm_5",
    name: "Tech News",
    slug: "tech-news",
    description: "Framework updates, open-source releases, and engineering announcements.",
    icon: "⚡",
    bannerColor: "#f3f4f6",
    membersCount: 0,
    rules: ["Cite primary sources", "No duplicates"],
  },
];

// ZERO MOCK POSTS - ONLY REAL USER POSTS
export const INITIAL_POSTS: PostType[] = [];

// ZERO MOCK COMMENTS
export const INITIAL_COMMENTS: CommentType[] = [];
